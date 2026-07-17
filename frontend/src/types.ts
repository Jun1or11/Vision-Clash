export interface Player {
  id: string
  name: string
  role: "number_seeker" | "letter_seeker"
  score: number
}

export interface Circle {
  x: number
  y: number
  radius: number
  number: number
  is_target: boolean
}

export interface GameState {
  circles: Circle[]
  target_number: number
  letter_grid: string[][]
  target_letter: string
  players: Record<string, Player>
  time_left: number
  status: "waiting" | "playing" | "finished"
  round: number
  winner_id: string | null
}

export interface ServerMessage {
  type: string
  payload: Record<string, unknown>
  state?: GameState
}

export interface ClientMessage {
  type: "join" | "click_number" | "click_letter" | "request_rematch"
  payload: Record<string, unknown>
}
