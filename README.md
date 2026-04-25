# Sportz

A real-time sports match tracking app. Create matches, follow live commentary, and watch scores update instantly via WebSocket.

## Stack

- **Backend**: Node.js, Express, WebSocket (`ws`), Drizzle ORM, PostgreSQL, Zod
- **Frontend**: React, TanStack Query, Vite, Tailwind CSS, Framer Motion

## Project structure

```
sportz/
├── src/              # Backend
│   ├── index.ts      # Entry point — Express + WebSocket server
│   ├── routes/       # REST API routes
│   ├── ws/           # WebSocket server and broadcast logic
│   ├── db/           # Drizzle schema and client
│   └── validation/   # Zod schemas
├── client/           # Frontend (React)
│   └── src/
│       ├── pages/    # MatchesHub (list) and MatchDetail (live view)
│       ├── hooks/    # useWebSocket — connection, subscriptions
│       ├── lib/      # API fetch helpers
│       └── types/    # Shared TypeScript types
├── scripts/          # Dev utilities
└── utils/            # Shared helpers
```

## Getting started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database

### Setup

```bash
# Install dependencies
pnpm install
cd client && pnpm install

# Configure environment
cp .env.example .env
# Add your DATABASE_URL to .env

# Run migrations
pnpm db:migrate
```

### Development

```bash
# Start backend (port 3000)
pnpm dev

# Start frontend (port 5173) — in a separate terminal
cd client && pnpm dev
```

The frontend proxies `/matches` and `/ws` to the backend, so both servers need to be running.

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/matches` | List all matches |
| `POST` | `/matches` | Create a match |
| `PATCH` | `/matches/:id/status` | Update match status |
| `GET` | `/matches/:id/commentary` | List commentary for a match |
| `POST` | `/matches/:id/commentary` | Add a commentary event |

## WebSocket

Connect to `ws://localhost:3000/ws`. Send JSON payloads to subscribe or unsubscribe from a match:

```json
{ "type": "Match Subscription", "matchId": "<uuid>" }
{ "type": "Match Unsubscribe", "matchId": "<uuid>" }
```

The server broadcasts:

| Type | Trigger |
|------|---------|
| `Match Created` | A new match is created |
| `Commentary` | A commentary event is posted |
| `Score Update` | A goal is recorded or match status changes |

## Simulate a match

Run a full El Clásico simulation with commentary every 5 seconds:

```bash
pnpm simulate
```

## Database

```bash
pnpm db:generate   # Generate migration from schema changes
pnpm db:migrate    # Apply pending migrations
pnpm db:studio     # Open Drizzle Studio
```
