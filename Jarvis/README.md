# Jarvis Dashboard

**The command center for gAIng-brAin** - A Next.js dashboard for monitoring and controlling the multi-agent AI orchestration system.

## Features

- 🖥️ **Real-time Monitoring** - Live system health and status updates
- 👥 **Agent Status** - Monitor Claude, Gemini, Codex, and Grok agents
- 💾 **Memory Metrics** - Track collective and individual agent memory
- 📊 **System Analytics** - Performance metrics and resource usage
- 🔌 **WebSocket Integration** - Real-time event streaming
- 🎨 **Modern UI** - Glass morphism design with Tailwind CSS

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **API Client:** Axios

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Running gAIng-brAin backend server

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your backend URL
nano .env
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t jarvis-dashboard .

# Run container
docker run -p 3000:3000 \
  -e BACKEND_URL=http://localhost:8080 \
  -e WS_URL=ws://localhost:8080/ws \
  jarvis-dashboard
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BACKEND_URL` | gAIng-brAin API URL | `http://localhost:8080` |
| `WS_URL` | WebSocket endpoint | `ws://localhost:8080/ws` |
| `NODE_ENV` | Environment mode | `production` |

## Project Structure

```
Jarvis/
├── app/                # Next.js app directory
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Dashboard page
├── components/        # React components
│   ├── SystemHealth.tsx
│   ├── AgentStatus.tsx
│   ├── MemoryMetrics.tsx
│   └── RealtimeLog.tsx
├── public/            # Static assets
├── next.config.js     # Next.js configuration
├── tailwind.config.js # Tailwind CSS configuration
└── tsconfig.json      # TypeScript configuration
```

## Features in Detail

### System Health
- Overall system status (healthy/degraded/unhealthy)
- Service status monitoring
- Real-time warnings and alerts
- Last update timestamp

### Agent Status
- **Claude** - Deep Reasoner
- **Gemini** - Strategy & Operations
- **Codex** - Technical Architect
- **Grok** - Real-time Intelligence

### Memory Metrics
- Total memories stored
- Recent activity (24h)
- Active memory sources
- The Hood (collective) status
- Street Knowledge (individual) status

### Real-time Log
- WebSocket connection to backend
- Live event streaming
- Colored log levels (info/warning/error/success)
- Auto-scroll to latest entries
- Clear log functionality

## Integration with gAIng-brAin

Jarvis connects to the gAIng-brAin backend via:

1. **REST API** - `/health`, `/members`, `/memories` endpoints
2. **WebSocket** - Real-time event streaming at `/ws`
3. **Shared Environment** - Configuration via environment variables

## Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS utility classes
- Maintain responsive design (mobile-first)
- Keep components small and focused
- Handle loading and error states
- Test WebSocket reconnection logic

## Troubleshooting

### Cannot connect to backend
- Ensure gAIng-brAin server is running
- Check `BACKEND_URL` in .env
- Verify CORS settings on backend

### WebSocket connection fails
- Check `WS_URL` in .env
- Ensure WebSocket endpoint is enabled on backend
- Check browser console for errors

### Build errors
- Delete `.next` folder and rebuild
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## License

ISC - Part of the gAIng-brAin project

## Author

gAIng Collective

---

**Part of the gAIng-brAin Multi-Agent AI Orchestration Platform**
