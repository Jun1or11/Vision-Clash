import { useState } from "react"
import { useWebSocket } from "./hooks/useWebSocket"
import HomeScreen from "./components/HomeScreen"
import GameScreen from "./components/GameScreen"
import "./App.css"

export default function App() {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState("")
  const { connected, gameState, playerId, roomCode, error, sendMessage } = useWebSocket(
    roomId,
    playerName
  )

  const handleJoinRoom = (rid: string, name: string) => {
    setRoomId(rid)
    setPlayerName(name)
  }

  if (!roomId) {
    return <HomeScreen onJoinRoom={handleJoinRoom} />
  }

  if (!connected) {
    return (
      <div className="loading-screen">
        <p>{error ? `Error: ${error}` : "Conectando al servidor..."}</p>
      </div>
    )
  }

  if (!gameState || gameState.status === "waiting") {
    return (
      <div className="loading-screen">
        <p>Esperando jugadores...</p>
        {roomCode && (
          <p className="room-code">
            Código de sala: <strong>{roomCode}</strong> — compártelo con tu oponente
          </p>
        )}
      </div>
    )
  }

  return (
    <GameScreen
      state={gameState}
      playerId={playerId}
      sendMessage={sendMessage}
    />
  )
}
