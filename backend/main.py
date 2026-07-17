import asyncio
import random
import uuid

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from game import generate_letter_grid, generate_round, GRID_SIZE, PENALTY_SECONDS, TIMER_SECONDS
from models import Player
from room_manager import RoomManager

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = RoomManager()
room_connections: dict[str, dict[str, WebSocket]] = {}
room_timers: dict[str, asyncio.Task] = {}


async def broadcast(room_id: str, message: dict):
    if room_id not in room_connections:
        return
    for ws in room_connections[room_id].values():
        try:
            await ws.send_json(message)
        except Exception:
            pass


async def broadcast_to_player(room_id: str, player_id: str, message: dict):
    if room_id in room_connections and player_id in room_connections[room_id]:
        try:
            await room_connections[room_id][player_id].send_json(message)
        except Exception:
            pass


async def game_timer(room_id: str):
    room = manager.get_room(room_id)
    if not room:
        return
    try:
        while room.state.time_left > 0 and room.state.status == "playing":
            await asyncio.sleep(1)
            if room.state.status != "playing":
                break
            room.state.time_left -= 1
            await broadcast(room_id, {
                "type": "state_update",
                "payload": {"state": room.state.model_dump()}
            })

        if room.state.status == "playing":
            room.state.status = "finished"
            scores = {pid: p.score for pid, p in room.state.players.items()}
            winner_id = max(scores, key=scores.get)
            room.state.winner_id = winner_id
            await broadcast(room_id, {
                "type": "game_over",
                "payload": {"winner_id": winner_id, "scores": scores}
            })
    except asyncio.CancelledError:
        pass
    finally:
        room_timers.pop(room_id, None)


async def handle_message(room, player_id: str, data: dict, room_id: str):
    msg_type = data.get("type")
    payload = data.get("payload", {})
    player = room.state.players.get(player_id)
    if not player:
        return

    if msg_type == "click_number":
        if player.role != "number_seeker":
            await broadcast_to_player(room_id, player_id, {
                "type": "error",
                "payload": {"message": "No eres el buscador de números"}
            })
            return

        number = payload.get("number")
        if number == room.state.target_number:
            for p in room.state.players.values():
                p.role = "letter_seeker" if p.role == "number_seeker" else "number_seeker"
            generate_round(room.state)
            await broadcast(room_id, {
                "type": "state_update",
                "payload": {"state": room.state.model_dump()}
            })
        else:
            room.state.time_left = max(0, room.state.time_left - PENALTY_SECONDS)
            await broadcast(room_id, {
                "type": "state_update",
                "payload": {"state": room.state.model_dump()}
            })

    elif msg_type == "click_letter":
        if player.role != "letter_seeker":
            await broadcast_to_player(room_id, player_id, {
                "type": "error",
                "payload": {"message": "No eres el buscador de letras"}
            })
            return

        row = payload.get("row")
        col = payload.get("col")
        if 0 <= row < GRID_SIZE and 0 <= col < GRID_SIZE:
            if room.state.letter_grid[row][col] == room.state.target_letter:
                player.score += 10
                grid, target = generate_letter_grid()
                room.state.letter_grid = grid
                room.state.target_letter = target
                await broadcast(room_id, {
                    "type": "state_update",
                    "payload": {"state": room.state.model_dump()}
                })

    elif msg_type == "request_rematch":
        if room.state.status != "finished":
            return
        if player_id not in room.state.rematch_ready:
            room.state.rematch_ready.append(player_id)
        await broadcast(room_id, {
            "type": "rematch_update",
            "payload": {"rematch_ready": list(room.state.rematch_ready)}
        })
        if len(room.state.rematch_ready) == 2:
            import random
            room.state.rematch_ready.clear()
            players_list = list(room.state.players.values())
            random.shuffle(players_list)
            players_list[0].role = "number_seeker"
            players_list[1].role = "letter_seeker"
            for p in room.state.players.values():
                p.score = 0
            room.state.status = "playing"
            room.state.time_left = TIMER_SECONDS
            room.state.round = 0
            generate_round(room.state)
            await broadcast(room_id, {
                "type": "game_start",
                "payload": {"state": room.state.model_dump()}
            })
            room_timers[room_id] = asyncio.create_task(game_timer(room_id))


@app.post("/rooms")
async def create_room():
    room = manager.create_room()
    return {"room_id": room.room_id, "code": room.code}


@app.get("/rooms/{code}")
async def get_room_by_code(code: str):
    room = manager.get_room_by_code(code)
    if not room:
        raise HTTPException(status_code=404, detail="Sala no encontrada")
    return {"room_id": room.room_id, "code": room.code}


@app.websocket("/ws/game/{room_id}")
async def game_websocket(websocket: WebSocket, room_id: str):
    room = manager.get_room(room_id)
    if not room:
        await websocket.close(code=4004)
        return

    await websocket.accept()
    player_id = None

    try:
        data = await websocket.receive_json()
        if data.get("type") != "join":
            await websocket.send_json({
                "type": "error",
                "payload": {"message": "Primer mensaje debe ser 'join'"}
            })
            await websocket.close()
            return

        player_name = data.get("payload", {}).get("player_name", "Anonymous")

        if len(room.state.players) >= 2:
            await websocket.send_json({
                "type": "error",
                "payload": {"message": "Sala llena"}
            })
            await websocket.close()
            return

        player_id = str(uuid.uuid4())
        temp_role = "number_seeker" if len(room.state.players) == 0 else "letter_seeker"
        player = Player(id=player_id, name=player_name, role=temp_role)
        room.state.players[player_id] = player
        room_connections.setdefault(room_id, {})[player_id] = websocket

        await websocket.send_json({
            "type": "room_joined",
            "payload": {
                "player_id": player_id,
                "role": temp_role,
                "room_code": room.code
            }
        })

        if len(room.state.players) == 2:
            players_list = list(room.state.players.values())
            random.shuffle(players_list)
            players_list[0].role = "number_seeker"
            players_list[1].role = "letter_seeker"
            room.state.status = "playing"
            room.state.time_left = TIMER_SECONDS
            generate_round(room.state)
            await broadcast(room_id, {
                "type": "game_start",
                "payload": {"state": room.state.model_dump()}
            })
            room_timers[room_id] = asyncio.create_task(game_timer(room_id))

        while True:
            data = await websocket.receive_json()
            await handle_message(room, player_id, data, room_id)

    except WebSocketDisconnect:
        if player_id and manager.get_room(room_id):
            room.state.status = "finished"
            other = [p for p in room.state.players.values() if p.id != player_id]
            if other:
                room.state.winner_id = other[0].id
            await broadcast(room_id, {
                "type": "game_over",
                "payload": {
                    "winner_id": room.state.winner_id,
                    "scores": {pid: p.score for pid, p in room.state.players.items()}
                }
            })
            if room_id in room_timers:
                room_timers[room_id].cancel()
            room_connections.pop(room_id, None)
            manager.remove_room(room_id)

    except Exception as e:
        print(f"Error en sala {room_id}: {e}")
    finally:
        if room_id in room_connections and player_id:
            room_connections[room_id].pop(player_id, None)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
