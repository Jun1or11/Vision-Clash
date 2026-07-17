# Dual Search

Juego web multijugador 1vs1 en tiempo real. Dos jugadores compiten buscando números y letras mientras los roles se intercambian constantemente.

## Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Python + FastAPI + WebSockets
- **Estado:** En memoria (dict de salas)

## Requisitos

- Python 3.10+
- Node.js 18+

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/Jun1or11/Vision-Clash.git
cd Vision-Clash
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

El backend se levanta en `http://localhost:8000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend se levanta en `http://localhost:5173`.

### 4. Jugar

Abrí **dos pestañas** en `http://localhost:5173`:

1. En la primera: ingresá tu nombre → **Crear Sala**
2. En la segunda: ingresá otro nombre → **Unirse** con el código que apareció en la primera

## Mecánica del juego

- **Buscador de números:** Encuentra el número objetivo entre 20 círculos dispersos. Acierto → se intercambian roles. Error → −2 segundos al cronómetro.
- **Buscador de letras:** Encuentra la letra objetivo en un grid 6×6. Cada acierto suma +10 puntos y regenera el grid con una nueva letra objetivo.
- **Roles:** Se asignan al azar al iniciar la partida y se intercambian cada vez que el buscador de números acierta.
- **Duración:** 60 segundos. Gana quien tenga más puntos cuando el timer llegue a 0.

## APIs

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/rooms` | Crear una sala |
| GET | `/rooms/{code}` | Obtener sala por código |
| WS | `/ws/game/{room_id}` | Conexión WebSocket del juego |
