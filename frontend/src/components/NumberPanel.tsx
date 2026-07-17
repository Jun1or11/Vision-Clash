import type { Circle as CircleType, GameState } from "../types"

interface NumberPanelProps {
  state: GameState
  sendMessage: (msg: object) => void
}

export default function NumberPanel({ state, sendMessage }: NumberPanelProps) {
  return (
    <div className="panel number-panel">
      <h3 className="panel-title">
        Encuentra el número: <span className="target">{state.target_number}</span>
      </h3>
      <div className="circles-container">
        {state.circles.map((circle: CircleType, i: number) => (
          <button
            key={i}
            className="circle"
            style={{
              left: circle.x,
              top: circle.y,
              width: circle.radius * 2,
              height: circle.radius * 2,
              fontSize: Math.max(14, circle.radius * 0.5),
            }}
            onClick={() =>
              sendMessage({
                type: "click_number",
                payload: { number: circle.number },
              })
            }
          >
            {circle.number}
          </button>
        ))}
      </div>
    </div>
  )
}
