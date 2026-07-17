import { useEffect, useRef, useState } from "react"
import type { Circle as CircleType, GameState } from "../types"

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 400

interface NumberPanelProps {
  state: GameState
  sendMessage: (msg: object) => void
}

export default function NumberPanel({ state, sendMessage }: NumberPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width
        setScale(Math.min(1, w / CANVAS_WIDTH))
      }
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="panel number-panel">
      <h3 className="panel-title">
        Encuentra el número: <span className="target">{state.target_number}</span>
      </h3>
      <div className="circles-container" ref={containerRef} style={{ height: CANVAS_HEIGHT * scale }}>
        {state.circles.map((circle: CircleType, i: number) => (
          <button
            key={i}
            className="circle"
            style={{
              left: circle.x * scale,
              top: circle.y * scale,
              width: circle.radius * 2 * scale,
              height: circle.radius * 2 * scale,
              fontSize: Math.max(14, circle.radius * 0.5) * scale,
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
