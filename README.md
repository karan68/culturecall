# CultureCall — Real-Time Cultural Intelligence Co-Pilot

**Real-time cultural insights for high-stakes conversations across languages.**

A hackathon-scale AI system that analyzes live conversations (sales calls, job interviews, team meetings) and surfaces cultural intelligence to prevent miscommunication and build trust across language and cultural boundaries.

---

## Overview

CultureCall watches conversation transcripts in real-time and flags cultural patterns that might cause misunderstanding:

- **Sales Call**: US rep vs. Tokyo prospect. Flag "soft rejections" in Japanese that sound like interest.
- **Job Interview**: American interviewer vs. Brazilian candidate. Recognize high-context storytelling as competence, not rambling.
- **Team Meeting**: US product team vs. German engineers. German directness is respect, not aggression.

At the core: **Lingo.dev CLI + SDK + MCP** manages cultural knowledge bases and provides live translation, **Groq LLM** provides cultural reasoning, and **Socket.io** streams everything in real-time.

---

## Architecture

```
┌─ Lingo.dev CLI ─────────────────────────────────────┐
│  Version-controlled cultural glossaries              │
│  (en-sales.json, en-meetings.json, reference data)  │
└────────────────────────────────────────────────────┘
                         ↓
┌─ Lingo.dev MCP Server (Developer Experience) ──────┐
│  AI-assisted i18n setup in VS Code / Cursor / Codex │
│  Structured framework-specific i18n knowledge       │
└────────────────────────────────────────────────────┘
                         ↓
┌─ Backend (Node.js + Socket.io) ─────────────────────┐
│  • Streams demo transcript in real-time             │
│  • Loads cultural glossaries via Lingo CLI          │
│  • Groq LLM analyzes phrases for cultural context   │
│  • Lingo SDK: localizeText() for live chat transl.  │
│  • Lingo SDK: recognizeLocale() for lang detection  │
│  • Lingo SDK: localizeObject() for insight transl.  │
│  • Lingo SDK: localizeChat() for bilingual reports  │
│  • Emits insights + translations via Socket.io      │
└────────────────────────────────────────────────────┘
                         ↓
┌─ Frontend (Next.js + React) ───────────────────────┐
│  • Lingo SDK translates all UI strings dynamically  │
│  • Live transcript + inline translations            │
│  • Cultural insight cards (severity-coded)          │
│  • Translated coaching (per participant language)   │
│  • Bilingual PDF report generation                 │
│  • Auto-detected language badges per message       │
└────────────────────────────────────────────────────┘
```

---

## Project Structure

```
culturecall/
├── .vscode/
│   └── mcp.json                    # Lingo.dev MCP server config
├── locales/
│   ├── cultural/
│   │   ├── en-sales.json           # Japanese sales patterns
│   │   ├── en-meetings.json        # German meeting patterns
│   │   ├── en-interviews.json      # Brazilian interview patterns
│   │   └── reference-data.json     # Glossary mappings
│   └── ui/
│       └── en.json                 # UI strings (English source)
├── apps/
│   ├── web/                        # Next.js frontend
│   │   ├── app/
│   │   │   ├── page.tsx           # Home: scenario selection
│   │   │   ├── call/page.tsx      # Main call view
│   │   │   ├── chat/page.tsx      # 2-person live chat
│   │   │   └── report/page.tsx    # Post-call report
│   │   ├── components/
│   │   │   ├── InsightCard.tsx     # Bilingual insight display
│   │   │   ├── UiI18nProvider.tsx  # Lingo SDK i18n context
│   │   │   ├── LocaleSwitcher.tsx  # UI language switcher
│   │   │   └── TranscriptPanel.tsx
│   │   ├── hooks/
│   │   │   ├── useSocket.ts
│   │   │   └── useChatSocket.ts    # Handles translations + insights
│   │   └── lib/
│   │       ├── lingo-client.ts
│   │       ├── ui-messages.server.ts # Lingo SDK server-side
│   │       └── ui-locales.ts
│   └── signaling/                  # Node.js signaling server
│       ├── src/
│       │   ├── index.ts
│       │   └── services/
│       │       ├── groq-service.ts
│       │       ├── glossary-service.ts       # Lingo SDK: whoami()
│       │       ├── lingo-translation-service.ts # All SDK methods
│       │       └── reportGenerator.ts        # Bilingual PDF
├── packages/
│   └── shared/
│       └── types/
│           └── call.ts
├── i18n.json                       # Lingo.dev CLI configuration
└── pnpm-workspace.yaml             # Monorepo setup
```

---

## Setup & Installation

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** (package manager)
- **API Keys**:
  - Groq API key (free tier: https://console.groq.com)
  - Optional: Lingo.dev API key (for production)

### 1. Clone & Install

```bash
cd culturecall
pnpm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` in the root and in `apps/web/`:

```bash
cp .env.example .env.local
cp .env.example apps/web/.env.local
```

Fill in your API keys:

```
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_LINGO_API_KEY=demo-key  # Mock for hackathon
```

### 3. Run Development Servers

**Terminal 1 — Backend (Signaling Server):**

```bash
pnpm --filter=signaling dev
```

Expected output:
```
Signaling server listening on port 3001
Socket.io ready for connections
Loaded 3 glossary files: sales, meetings, interviews
```

**Terminal 2 — Frontend (Next.js):**

```bash
pnpm --filter=web dev
```

Expected output:
```
  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
```

### 4. Open in Browser

Navigate to `http://localhost:3000`

---

## How to Use the Demo

### Step 1: Home Page
- See three call scenarios:
  - **Sales Call** (EN↔JA): US rep selling to Tokyo enterprise
  - **Job Interview** (EN↔PT-BR): American PM interviewing Brazilian candidate
  - **Team Meeting** (EN↔DE): US product team with German engineers

- Click to select a scenario

### Step 2: Live Call Simulation
- Call automatically plays a **pre-recorded transcript** with cultural patterns
- Watch in real-time:
  - **Left panel**: Call simulation (video placeholder)
  - **Middle panel**: Live transcript (scrolling)
  - **Right panel**: Cultural insights as they're detected

### Step 3: Cultural Insights
Insights are color-coded by severity:
- 🔴 **High** (red): Immediate action needed
- 🟡 **Medium** (yellow): Monitor and be aware
- 🟢 **Low** (blue): Neutral observation

Each insight shows:
- **Observation**: What happened in the conversation
- **Cultural Context**: Why it matters in that culture
- **Suggested Response**: What to say/do next
- **Action**: PAUSE, WAIT, ENGAGE, etc.

### Step 4: Post-Call Report
After the call ends, click **"View Report"** to see:
- **Duration, Language Pair, Friction Score** (0-10)
- **High-Risk Moments**: Red flags that could damage trust
- **High-Trust Moments**: What went well
- **Coaching Points**: Specific tips for next call

---

## Key Technologies

| Layer | Tech | Purpose |
|-------|------|---------|
| **Glossary Management** | Lingo.dev CLI | Version-controlled cultural knowledge base |
| **Live Translation** | Lingo.dev SDK `localizeText()` | Real-time message translation between participants |
| **Language Detection** | Lingo.dev SDK `recognizeLocale()` | Auto-detect incoming message language |
| **Insight Localization** | Lingo.dev SDK `localizeObject()` | Translate coaching text to each participant's language |
| **Bilingual Reports** | Lingo.dev SDK `localizeChat()` | Side-by-side transcript in PDF reports |
| **UI Translation** | Lingo.dev SDK `localizeObject()` | Dynamic UI string translation (5 locales) |
| **Developer Experience** | Lingo.dev MCP Server | AI-assisted i18n in VS Code, Cursor, Codex |
| **Frontend** | Next.js 15 + React 19 | Beautiful dark-professional UI |
| **Real-Time** | Socket.io | Stream transcript + insights + translations |
| **LLM** | Groq (free) | Cultural reasoning & analysis |
| **Styling** | Tailwind CSS | Dark theme (slate-900, amber accents) |
| **Types** | TypeScript | Monorepo type-safe |

---

## Glossaries Explained

### en-sales.json
8 Japanese business patterns in sales context:
- `ja-soft-rejection`: "That's interesting" = polite no
- `ja-silence-processing`: Long silence = thinking, not rejection
- `ja-formal-address`: Honorifics build trust
- `ja-group-consensus`: Decisions need team alignment
- `ja-written-confirmation`: Writing > verbal agreement
- etc.

### en-meetings.json
8 German business patterns in meetings:
- `de-direct-honesty`: Blunt criticism = respect
- `de-structured-agenda`: Stick to the plan
- `de-evidence-based`: Decisions need data
- `de-decision-clarity`: Who decides? When?
- etc.

### en-interviews.json
8 Brazilian cultural patterns in interviews:
- `pt-high-context-storytelling`: Narrative = competence
- `pt-warmth-authenticity`: Passion is professional
- `pt-relationship-building`: Team dynamics matter
- etc.

Each glossary entry has:
- **trigger**: Phrases that activate the insight
- **observation**: What it means
- **culturalFramework**: Anthropological context
- **tacticResponse**: What to do/say
- **severity**: low/medium/high
- **repAction**: PAUSE, WAIT, ENGAGE, etc.

---

## Backend: Glossary Loading Flow

1. **Startup**: `loadGlossaries()` reads all `en-*.json` files from `locales/cultural/`
2. **Cache**: Glossaries loaded in memory (fast, no API calls)
3. **Call Start**: Client emits `start-call` with scenario
4. **Per Line**: Backend checks if transcript matches any `trigger` in glossary
5. **Match**: Rule-based insight emitted directly (instant)
6. **No Match**: Optional: Call Groq for LLM analysis (slower, uses API quota)
7. **Emit**: Socket.io sends insight to frontend

---

## Frontend: Lingo.dev SDK Flow

1. **Init**: `LingoDotDevEngine` initialized with API key on both server and client
2. **UI Strings**: All labels translated via `localizeObject()` through `UiI18nProvider`
3. **Live Translation**: Every chat message auto-translated → shown as `🌐` subtitle below bubble
4. **Language Detection**: `recognizeLocale()` detects message language → `[ja]` badge on each message
5. **Insight Localization**: Coaching text (observation, framework, response) translated per participant
6. **Bilingual Report**: `localizeChat()` generates side-by-side transcript in PDF reports
7. **Locale Switcher**: UI language switchable between en, ja, de, pt-br, fr

---

## Lingo.dev MCP Server (Developer Experience)

CultureCall includes a **Lingo.dev MCP server** configuration for AI-assisted i18n development.

**Config**: `.vscode/mcp.json`
```json
{
  "servers": {
    "lingo-dev": {
      "command": "npx",
      "args": ["-y", "lingo.dev@latest", "mcp"],
      "env": {}
    }
  }
}
```

**What it does**: Gives AI coding assistants (GitHub Copilot, Cursor, Codex) structured access to framework-specific i18n knowledge. Instead of hallucinating API patterns, the assistant follows verified implementation patterns for Next.js.

**Supported IDEs**: Claude Code, Cursor, GitHub Copilot Agents, Codex (OpenAI)

**Usage**: Open VS Code in this workspace and prompt your assistant:
```
Set up i18n with the following locales: en, es, and pt-BR. The default locale is 'en'.
```
The MCP server provides the assistant with correct, framework-specific configuration steps.

---

## Demo Transcript

Pre-recorded sales call:
```
Rep (0s):  "Good morning! Thank you for taking the time..."
Prospect (3s): "Yes, of course. We're interested..."
Rep (7s): "Great! I'd love to tell you about..."
Prospect (10s): "That's interesting. We would need to consult internally." ← TRIGGER: soft rejection
Rep (15s): "Of course! What's your timeline?..."
```

The backend detects **"That's interesting"** in prospect's text, matches it against `ja-soft-rejection` trigger, and emits:
```json
{
  "observation": "Prospect signals withdrawal via indirect communication",
  "culturalFramework": "Japanese business: indirect...",
  "suggestedResponse": "Stop pushing. Send written summary.",
  "severity": "high",
  "repAction": "PAUSE"
}
```

Frontend receives socket event, renders InsightCard in real-time.

---

## Extending the System

### Add a New Language Pair

1. **Create source glossary**: `locales/cultural/en-{language}-{usecase}.json`
   ```json
   {
     "pattern-id": {
       "trigger": ["phrase1", "phrase2"],
       "observation": "...",
       "culturalFramework": "...",
       "tacticResponse": "...",
       "severity": "high",
       "repAction": "PAUSE"
     }
   }
   ```

2. **Run Lingo.dev**:
   ```bash
   npx lingo.dev run
   ```
   This auto-translates your glossary to other languages.

3. **Add UI support**: Update frontend to map scenario → glossary file.

### Enable Groq LLM Analysis

Uncomment in `apps/signaling/src/index.ts`:
```typescript
// const llmInsight = await analyzeCulturalContext({...});
```

This calls Groq for deeper analysis on non-matching phrases (uses free tier quota).

---

## Performance Notes

- **Glossary Loading**: ~5ms (JSON files, in-memory)
- **Rule-Matching**: <1ms (string search)
- **Groq API Call**: 2-5 seconds (if enabled)
- **Socket.io Emission**: <10ms
- **UI Re-render**: <50ms

For hackathon speed, rule-based matching is instant. Groq is optional.

---

## Troubleshooting

### "Connection failed"
- Check backend is running: `curl http://localhost:3001/health`
- Verify Socket.io URL in `NEXT_PUBLIC_SOCKET_URL`

### "Glossaries not loading"
- Ensure `locales/cultural/*.json` files exist
- Backend should log: "Loaded 3 glossary files: sales, meetings, interviews"

### "Insights not appearing"
- Check browser console for Socket.io errors
- Verify transcript phrases match glossary triggers (case-insensitive)

### "Groq API errors"
- Verify `GROQ_API_KEY` is set in `.env.local`
- Groq free tier: 30 req/min. Hackathon scope should not hit limit.

---

## Build & Deployment

### Build

```bash
pnpm build
```

### Docker (Optional)

```bash
docker build -f apps/signaling/Dockerfile -t culturecall-signaling .
docker build -f apps/web/Dockerfile -t culturecall-web .
```

### Deploy Frontend (Vercel)

```bash
vercel deploy apps/web
```

### Deploy Backend (Railway.app)

```bash
railway up
```

---

## Team & Credits

**CultureCall** — Built for hackathon with:
- **Lingo.dev** (CLI + SDK + MCP: glossary management, live translation, language detection, insight localization, bilingual reports, developer tooling)
- **Groq** (free LLM for cultural reasoning)
- **Socket.io** (real-time streaming)
- **Next.js + React** (frontend)
- **TypeScript** (type safety)

---

## Lingo.dev SDK Methods Used

| SDK Method | File | Purpose |
|---|---|---|
| `whoami()` | glossary-service.ts | API key validation on startup |
| `localizeObject()` | ui-messages.server.ts | Runtime UI translation (5 locales) |
| `localizeText()` | lingo-translation-service.ts → index.ts | Live chat message translation |
| `recognizeLocale()` | lingo-translation-service.ts → index.ts | Auto-detect message language |
| `localizeObject()` | lingo-translation-service.ts → index.ts | Translate insight coaching text |
| `localizeChat()` | lingo-translation-service.ts → index.ts | Bilingual transcript for PDF reports |
| **Lingo.dev CLI** | i18n.json | Translate UI locale files (en→ja,de,pt-br,fr) |
| **Lingo.dev MCP** | .vscode/mcp.json | AI-assisted i18n for developers |

---

## License

Open source. Feel free to extend and adapt.

---

## Next Steps

1. **Try all three scenarios** to see different cultural patterns.
2. **Dive into glossaries** (`locales/cultural/`) to see what insights are available.
3. **Add your own patterns** — The system is designed for easy extension.
4. **Enable Groq** for LLM-powered deeper analysis.
5. **Translate UI** fully with real Lingo SDK API (production).

---

**Happy hacking! 🌍**
