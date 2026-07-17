import { useState } from "react"
import type { GameState } from "../types"

interface LetterGridProps {
  state: GameState
  sendMessage: (msg: object) => void
}

export default function LetterGrid({ state, sendMessage }: LetterGridProps) {
  const [lastClicked, setLastClicked] = useState<{ row: number; col: number } | null>(null)

  const handleClick = (row: number, col: number) => {
    setLastClicked({ row, col })
    sendMessage({
      type: "click_letter",
      payload: { row, col },
    })
    setTimeout(() => setLastClicked(null), 300)
  }

  return (
    <div className="panel letter-panel">
      <h3 className="panel-title">
        Encuentra la letra: <span className="target">{state.target_letter}</span>
      </h3>
      <div className="letter-grid">
        {state.letter_grid.map((row: string[], r: number) =>
          row.map((letter: string, c: number) => (
            <button
              key={`${r}-${c}`}
              className={`cell ${lastClicked?.row === r && lastClicked?.col === c ? "clicked" : ""}`}
              onClick={() => handleClick(r, c)}
            >
              {letter}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
