import { useState } from "react"

interface HomeScreenProps {
  onJoinRoom: (roomId: string, playerName: string) => void
}

export default function HomeScreen({ onJoinRoom }: HomeScreenProps) {
  const [playerName, setPlayerName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

  const handleCreate = async () => {
    if (!playerName.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_URL}/rooms`, { method: "POST" })
      const data = await res.json()
      onJoinRoom(data.room_id, playerName.trim())
    } catch {
      setError("No se pudo conectar al servidor")
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!playerName.trim() || !roomCode.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_URL}/rooms/${roomCode.trim().toUpperCase()}`)
      if (!res.ok) {
        setError("Sala no encontrada")
        return
      }
      const data = await res.json()
      onJoinRoom(data.room_id, playerName.trim())
    } catch {
      setError("No se pudo conectar al servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home-screen">
      <h1 className="title">Dual Search</h1>
      <p className="subtitle">Encuentra el número o la letra antes que tu oponente</p>

      <div className="home-card">
        <input
          type="text"
          placeholder="Tu nombre"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={20}
        />

        <button className="btn-create" onClick={handleCreate} disabled={loading || !playerName.trim()}>
          {loading ? "Creando..." : "Crear Sala"}
        </button>

        <div className="divider">o</div>

        <input
          type="text"
          placeholder="Código de sala"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          maxLength={6}
        />

        <button className="btn-join" onClick={handleJoin} disabled={loading || !playerName.trim() || !roomCode.trim()}>
          {loading ? "Buscando..." : "Unirse"}
        </button>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}
