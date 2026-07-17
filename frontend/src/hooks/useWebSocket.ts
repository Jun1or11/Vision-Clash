import { useCallback, useEffect, useRef, useState } from "react"
import type { GameState, ServerMessage } from "../types"

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/game"

interface UseWebSocketReturn {
  connected: boolean
  gameState: GameState | null
  playerId: string | null
  roomCode: string | null
  error: string | null
  sendMessage: (msg: object) => void
}

export function useWebSocket(roomId: string | null, playerName: string = ""): UseWebSocketReturn {
  const ws = useRef<WebSocket | null>(null)
  const joinSent = useRef(false)
  const [connected, setConnected] = useState(false)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roomId) return

    joinSent.current = false
    const socket = new WebSocket(`${WS_URL}/${roomId}`)
    ws.current = socket

    socket.onopen = () => {
      setConnected(true)
      if (playerName) {
        socket.send(JSON.stringify({ type: "join", payload: { player_name: playerName } }))
        joinSent.current = true
      }
    }

    socket.onclose = () => {
      setConnected(false)
    }

    socket.onerror = () => {
      setError("Error de conexión")
    }

    socket.onmessage = (event) => {
      try {
        const data: ServerMessage = JSON.parse(event.data)

        switch (data.type) {
          case "room_joined":
            setPlayerId(data.payload.player_id as string)
            setRoomCode(data.payload.room_code as string)
            break
          case "game_start":
          case "state_update":
            setGameState(data.payload.state as GameState)
            break
          case "game_over":
            setGameState((prev) =>
              prev
                ? {
                    ...prev,
                    status: "finished",
                    winner_id: data.payload.winner_id as string,
                  }
                : prev
            )
            break
          case "error":
            setError(data.payload.message as string)
            break
        }
      } catch {
        setError("Error al procesar mensaje del servidor")
      }
    }

    return () => {
      socket.close()
      ws.current = null
      setConnected(false)
      setGameState(null)
      setPlayerId(null)
      setRoomCode(null)
      setError(null)
    }
  }, [roomId, playerName])

  const sendMessage = useCallback((msg: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg))
    }
  }, [])

  return { connected, gameState, playerId, roomCode, error, sendMessage }
}
