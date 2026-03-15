# Environment Setup

Copy this file to `.env.local` and fill in your values.

## Backend (Node.js Signaling Server)

```
# Port for Socket.io server (default: 3001)
PORT=3001

# Groq API Integration (Optional)
GROQ_ENABLED=false  # Set to true to enable LLM-based cultural analysis
GROQ_API_KEY=       # Your Groq API key from console.groq.com

# Lingo.dev Integration (Optional)
LINGO_API_KEY=      # Your Lingo.dev API key for production translations

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

## Frontend (Next.js)

```
# Socket.io server URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Optional: Lingo API Key (if using production SDK)
NEXT_PUBLIC_LINGO_API_KEY=

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
```

## Getting Started Locally

1. **Create `.env.local`**:
   ```bash
   cp .env.example .env.local
   ```

2. **Start Backend** (Terminal 1):
   ```bash
   cd apps/signaling
   npm run dev
   ```
   Expected output: `Loaded 3 glossary files [ 'interviews', 'meetings', 'sales' ]`

3. **Start Frontend** (Terminal 2):
   ```bash
   cd apps/web
   npm run dev
   ```
   Expected output: `▲ Next.js 15 - Local: http://localhost:3000`

4. **Open in Browser**:
   - http://localhost:3000

## Features Enabled by Environment Variables

### GROQ_ENABLED=true
- Activates secondary LLM analysis via Groq Mixtral
- Requires valid GROQ_API_KEY
- When disabled: Rule-based cultural matching only (faster, no quota)
- **Default**: false (safe for demos)

### LINGO_API_KEY
- Activates real Lingo.dev SDK for UI translation
- Requires valid API key from Lingo.dev platform
- When not set: Mock Lingo SDK used (hardcoded translations)
- **Default**: unset (mock mode acceptable for hackathons)

## Troubleshooting

### Port 3000/3001 Already in Use
```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows PowerShell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Backend can't find glossaries
- Ensure `locales/cultural/` folder exists with JSON files
- Backend automatically logs: "Loaded 3 glossary files..."

### Frontend can't connect to backend
- Check `NEXT_PUBLIC_SOCKET_URL` matches backend port
- Verify backend is running (port 3001 listening)
- Check browser console for connection errors

### SWC Binary Errors
```bash
# Rebuild native modules
npm rebuild

# Or downgrade/upgrade Next.js
npm install next@15 --save
```

---

**Need Help?** Check `docs/DEMO_GUIDE.md` for demo walkthrough or `docs/ARCHITECTURE.md` for system design.
