import type { GameState } from "../types"
import NumberPanel from "./NumberPanel"
import LetterGrid from "./LetterGrid"
import Scoreboard from "./Scoreboard"

interface GameScreenProps {
  state: GameState
  playerId: string | null
  sendMessage: (msg: object) => void
}

export default function GameScreen({ state, playerId, sendMessage }: GameScreenProps) {
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
