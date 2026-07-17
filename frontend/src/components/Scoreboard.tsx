import type { GameState, Player } from "../types"

interface ScoreboardProps {
  state: GameState
  playerId: string | null
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export default function Scoreboard({ state, playerId }: ScoreboardProps) {
  const players = Object.values(state.players)
  const me = players.find((p) => p.id === playerId)

  return (
    <div className="scoreboard">
      {players.map((p: Player) => (
        <div
          key={p.id}
          className={`player-score ${p.id === playerId ? "me" : "opponent"}`}
        >
          <div className="player-name">
            {p.name} {p.id === playerId ? "(tú)" : ""}
          </div>
          <div className="player-role">
            {p.role === "number_seeker" ? "Números" : "Letras"}
          </div>
          <div className="player-points">{p.score} pts</div>
        </div>
      ))}

      <div className={`timer ${state.time_left <= 10 ? "urgent" : ""}`}>
        {formatTime(state.time_left)}
      </div>

      <div className="round-info">Ronda {state.round}</div>

      {me && (
        <div className="role-indicator">
          {me.role === "number_seeker"
            ? `Busca el número ${state.target_number} en los círculos`
            : `Busca la letra "${state.target_letter}" en la cuadrícula`}
        </div>
      )}
    </div>
  )
}
