import math
import random
import string

from models import Circle, GameState

CANVAS_WIDTH = 800
CANVAS_HEIGHT = 400
NUM_CIRCLES = 20
GRID_SIZE = 6
TIMER_SECONDS = 60
PENALTY_SECONDS = 2


def generate_circles() -> tuple[list[Circle], int]:
    target_number = random.randint(1, 100)
    circles: list[Circle] = []

    numbers = random.sample(range(1, 101), NUM_CIRCLES)
    if target_number not in numbers:
        numbers[-1] = target_number
    random.shuffle(numbers)

    for num in numbers:
        placed = False
        for _ in range(200):
            radius = random.uniform(30, 60)
            x = random.uniform(radius, CANVAS_WIDTH - radius)
            y = random.uniform(radius, CANVAS_HEIGHT - radius)

            overlap = False
            for c in circles:
                dist = math.hypot(x - c.x, y - c.y)
                if dist < radius + c.radius + 10:
                    overlap = True
                    break

            if not overlap:
                circles.append(
                    Circle(
                        x=x,
                        y=y,
                        radius=radius,
                        number=num,
                        is_target=(num == target_number),
                    )
                )
                placed = True
                break

        if not placed:
            radius = random.uniform(30, 60)
            x = random.uniform(radius, CANVAS_WIDTH - radius)
            y = random.uniform(radius, CANVAS_HEIGHT - radius)
            circles.append(
                Circle(
                    x=x,
                    y=y,
                    radius=radius,
                    number=num,
                    is_target=(num == target_number),
                )
            )

    return circles, target_number


def generate_letter_grid() -> tuple[list[list[str]], str]:
    target_letter = random.choice(string.ascii_uppercase)
    grid = [
        [random.choice(string.ascii_uppercase) for _ in range(GRID_SIZE)]
        for _ in range(GRID_SIZE)
    ]
    tr = random.randint(0, GRID_SIZE - 1)
    tc = random.randint(0, GRID_SIZE - 1)
    grid[tr][tc] = target_letter
    return grid, target_letter


def generate_round(state: GameState) -> None:
    circles, target_number = generate_circles()
    letter_grid, target_letter = generate_letter_grid()
    state.circles = circles
    state.target_number = target_number
    state.letter_grid = letter_grid
    state.target_letter = target_letter
    state.round += 1
