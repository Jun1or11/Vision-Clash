import type { GameState } from "../types"
import NumberPanel from "./NumberPanel"
import LetterGrid from "./LetterGrid"
import Scoreboard from "./Scoreboard"

interface GameScreenProps {
  state: GameState
  playerId: string | null
  sendMessage: (msg: object) => void
  rematchReady: string[]
}

export default function GameScreen({ state, playerId, sendMessage, rematchReady }: GameScreenProps) {
  const me = playerId ? state.players[playerId] : null
  if (!me) return null

  const isNumberSeeker = me.role === "number_seeker"

  return (
    <div className="game-screen">
      <Scoreboard state={state} playerId={playerId} />

      {state.status === "finished" ? (
        <div className="game-over">
          <h2>¡Partida terminada!</h2>
          {state.winner_id && (
            <p className="winner">
              Ganador: {state.players[state.winner_id]?.name || "Desconocido"}
            </p>
          )}
          <div className="final-scores">
            {Object.values(state.players).map((p) => (
              <div key={p.id} className="final-score">
                {p.name}: {p.score} pts
              </div>
            ))}
          </div>

          <div className="rematch-section">
            <button
              className="rematch-btn"
              onClick={() => sendMessage({ type: "request_rematch" })}
              disabled={rematchReady.includes(playerId || "")}
            >
              {rematchReady.includes(playerId || "") ? "Esperando oponente..." : "Revancha"}
            </button>
            {Object.values(state.players).map((p) =>
              p.id !== playerId && rematchReady.includes(p.id) ? (
                <p key={p.id} className="rematch-status">
                  {p.name} está listo ✓
                </p>
              ) : p.id !== playerId ? (
                <p key={p.id} className="rematch-status waiting">
                  Esperando a {p.name}...
                </p>
              ) : null
            )}
          </div>

          <button className="restart-btn" onClick={() => window.location.reload()}>
            Volver al inicio
          </button>
        </div>
      ) : (
        <>
          {isNumberSeeker ? (
            <NumberPanel state={state} sendMessage={sendMessage} />
          ) : (
            <LetterGrid state={state} sendMessage={sendMessage} />
          )}
        </>
      )}
    </div>
  )
}
