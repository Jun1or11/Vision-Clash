from models import GameRoom


class RoomManager:
    def __init__(self):
        self.rooms: dict[str, GameRoom] = {}
        self.code_to_id: dict[str, str] = {}

    def create_room(self) -> GameRoom:
        room = GameRoom()
        self.rooms[room.room_id] = room
        self.code_to_id[room.code] = room.room_id
        return room

    def get_room_by_code(self, code: str) -> GameRoom | None:
        room_id = self.code_to_id.get(code)
        if room_id:
            return self.rooms.get(room_id)
        return None

    def get_room(self, room_id: str) -> GameRoom | None:
        return self.rooms.get(room_id)

    def remove_room(self, room_id: str):
        if room_id in self.rooms:
            code = self.rooms[room_id].code
            del self.code_to_id[code]
            del self.rooms[room_id]
