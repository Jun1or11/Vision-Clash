from pydantic import BaseModel, Field
from typing import Literal, Optional
import uuid
import random
import string


class Circle(BaseModel):
    x: float
    y: float
    radius: float
    number: int
    is_target: bool = False


class Player(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "Anonymous"
    role: Literal["number_seeker", "letter_seeker"] = "number_seeker"
    score: int = 0


class GameState(BaseModel):
    circles: list[Circle] = []
    target_number: int = 0
    letter_grid: list[list[str]] = []
    target_letter: str = ""
    players: dict[str, Player] = {}
    time_left: int = 60
    status: Literal["waiting", "playing", "finished"] = "waiting"
    round: int = 0
    winner_id: Optional[str] = None
    rematch_ready: list[str] = []


class GameRoom(BaseModel):
    room_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str = Field(
        default_factory=lambda: "".join(
            random.choices(string.ascii_uppercase + string.digits, k=6)
        )
    )
    state: GameState = Field(default_factory=GameState)
