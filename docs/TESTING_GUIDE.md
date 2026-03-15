# CultureCall – Manual Testing Guide

Everything you need to run the app and test every feature end-to-end.

---

## 1. How to Run the Project

### Prerequisites
- Node.js 18+
- Two separate terminal windows (or tabs)

### Terminal 1 – Signaling / API Backend

```powershell
cd apps/signaling
npm run dev
```

Expected output:
```
🚀 CultureCall server running at http://localhost:3001
🤖 Groq AI enabled (llama3-8b-8192)
🌍 Lingo.dev enabled
```

### Terminal 2 – Next.js Frontend

```powershell
cd apps/web
npm run dev
```

Expected output:
```
▲ Next.js 15.x.x
- Local: http://localhost:3000
```

### Verify Both Are Up

```powershell
Invoke-RestMethod http://localhost:3001/health | ConvertTo-Json
```

Expected:
```json
{
  "status": "ok",
  "groqEnabled": true,
  "activeChatRooms": 0
}
```

---

## 2. App Pages at a Glance

| URL | What it is |
|-----|-----------|
| `http://localhost:3000` | Home – Solo Demo tab + Live Chat tab |
| `http://localhost:3000/chat` | Live 2-person room chat |
| `http://localhost:3000/dashboard` | Metrics dashboard |
| `http://localhost:3000/report` | Full session report |
| `http://localhost:3000/call` | Legacy demo call page |

---

## 3. Solo Demo Mode (Quick Test, No Second Browser)

1. Open `http://localhost:3000`
2. Click the **Solo Demo** tab
3. Pick a scenario from the dropdown
4. Click **▶ Play Script** (or step through with **Next Message**)
5. Watch insights populate in real time on the right panel

This replays pre-recorded JSON scripts from `apps/web/public/test-scripts/`.

---

## 4. Live 2-Person Chat (Full Feature Test)

You need **two browser windows** (or two devices on the same network).

### Step 1 – Create a Room (Person A)

1. Go to `http://localhost:3000`
2. Click **Live Chat** tab
3. Enter your name
4. Pick a **scenario** (Sales, Interview, or Meeting)
5. Click **Create Room**
6. Copy the 6-character room code shown on screen

### Step 2 – Join the Room (Person B)

1. Open a second browser window / incognito tab
2. Go to `http://localhost:3000`
3. Click **Live Chat** tab
4. Enter a different name
5. Paste the room code
6. Click **Join Room**

### Step 3 – Chat

Both participants can now type messages. Insights, FTA warnings, health score, and glossary are visible in the right panel of both windows.

---

## 5. Scenarios

### 5a. Sales – English ↔ Japanese (`sales`)

**Context:** US sales rep pitching SaaS to a Japanese enterprise buyer.
**Watch for:** indirect rejection, consensus language, relationship signals.

| Who | Message to type |
|-----|----------------|
| Jordan (US) | `Good morning, Tanaka-san! Thank you for making time. I'm excited to show you our platform.` |
| Tanaka (JP) | `Good morning. We are happy to listen.` |
| Jordan | `Can you tell me your biggest bottleneck right now?` |
| Tanaka | `Hmm… that is an interesting question. We have many considerations at this stage.` |
| Jordan | `Would this work for your team? Can you give me a yes or no?` → ⚠️ triggers **FTA: Direct confrontation** |
| Tanaka | `We would need to consult with our team. It is a process that takes time.` |
| Jordan | `Of course — would a written proposal help that you could share internally?` |
| Tanaka | `Yes, a written document would be very helpful.` |
| Jordan | `Great — I'll have it by end of week. Shall we do a follow-up call next week?` |
| Tanaka | `Let me check with my colleagues and we will confirm.` |

**Cultural terms to look for in Glossary tab (JP):**
- **nemawashi** – consensus-building before a formal decision
- **tatemae** – public face / official position
- **honne** – true feelings (hidden)
- **wa** – group harmony
- **ma** – comfortable silence
- **ringi** – formal approval-by-circulation process

---

### 5b. Interview – English ↔ Portuguese-BR (`interviews`)

**Context:** US PM interviewing a Brazilian PM candidate.
**Watch for:** warmth-first rapport, high-context storytelling, emotional self-disclosure.

| Who | Message to type |
|-----|----------------|
| Alex (US) | `Hi Camila! Tell me, walk me through your PM background.` |
| Camila (BR) | `Hi Alex! So happy to be here. Before we dive in — how are you doing today?` |
| Alex | `I'm great! So — PM experience?` |
| Camila | `It started in 2019 when my team had a huge retention problem. My manager Fernanda challenged me to find out why. I spent two weekends calling customers directly.` |
| Alex | `Can you give me the STAR format? Just give me a straight answer.` → ⚠️ triggers **FTA: Direct confrontation** |
| Camila | `Of course! Situation: 40% churn at 3 months. Task: diagnose it. Action: customer interviews plus cohort analysis. Result: churn dropped to 18% in 2 quarters.` |
| Alex | `Great. What's your biggest weakness?` |
| Camila | `I sometimes get too emotionally invested in the user's experience. I genuinely care about people, so I balance empathy with data decisions.` |
| Alex | `How do you handle conflict on a cross-functional team?` |
| Camila | `I always start by having a real conversation — not a Slack message. Most conflicts come from people not feeling heard.` |
| Alex | `Good. What metrics do you prioritize?` |
| Camila | `Early stage: activation and D7 retention. Growth: NPS, expansion revenue, feature adoption. Numbers tell you what, conversations tell you why.` |

**Cultural terms to look for in Glossary tab (BR):**
- **jeitinho** – creative workaround, Brazilian resourcefulness
- **simpatia** – social warmth and likability norm
- **saudade** – bittersweet longing (signals emotional depth)
- **high-context communication** – meaning embedded in relationship and tone
- **indirect no** – declining without saying no
- **relational clock** – relationship > rigid schedule

---

### 5c. Meeting – English ↔ German (`meetings`)

**Context:** US PM running roadmap planning with a German senior engineer.
**Watch for:** blunt disagreement, data demands, precision over enthusiasm.

| Who | Message to type |
|-----|----------------|
| Sarah (US) | `Hey team! Really excited about this quarter — let's kick off the roadmap review!` |
| Klaus (DE) | `Let us begin. I have reviewed the document and I have several concerns.` |
| Sarah | `Let's flag anything as we go!` |
| Klaus | `I prefer to address critical issues first. The timeline for Feature B is unrealistic — it will take 6 weeks minimum, not 3.` |
| Sarah | `I appreciate the honesty Klaus. Can you explain the technical constraints?` |
| Klaus | `The integration requires a full schema migration. The 3-week estimate was made without consulting engineering. This is a process issue.` |
| Sarah | `Fair point. Should we move Feature B to next quarter?` |
| Klaus | `That would be the technically correct decision. I also propose mandatory engineering review for all timeline estimates.` |
| Sarah | `Great idea! Now Feature A — I think this is going to be a huge win for users!` |
| Klaus | `According to what data?` → 📊 watch Health Score drop (low formality spike) |
| Sarah | `We have user research — 67% of users requested this feature plus NPS comments.` |
| Klaus | `Good. That is sufficient to prioritize. However, the specification is incomplete. Three edge cases are not covered in the PRD.` |
| Sarah | `I'll update the PRD by end of week. Does that work?` |
| Klaus | `Yes. I will block time Friday afternoon to review it.` |
| Sarah | `Perfect! Are you feeling good about where we're headed overall?` |
| Klaus | `I do not feel good — I can assess properly once the timeline is corrected and the spec is complete.` |

**Cultural terms to look for in Glossary tab (DE):**
- **sachlichkeit** – objective, fact-focused discussion style
- **gründlichkeit** – thoroughness as a core value
- **direkte kritik** – direct criticism as respect, not hostility
- **pünktlichkeit** – punctuality as reliability signal
- **low-context communication** – explicit, literal, document-based
- **technische autorität** – technical expertise earns authority

---

## 6. FTA (Face-Threatening Act) Trigger Phrases

These messages will fire a **🔴 FACE-THREAT** banner in the Insights tab with Brown & Levinson theory + suggested fix.

| FTA Type | Example phrase to type | Severity |
|----------|------------------------|----------|
| Urgency imposition | `I need a decision by Friday` | 🔴 High |
| Urgency imposition | `We require this ASAP` | 🔴 High |
| Urgency imposition | `Must have this by end of day` | 🔴 High |
| Formality override | `Just call me by my first name` | 🟡 Medium |
| Formality override | `Just be direct with me` | 🟡 Medium |
| Direct confrontation | `Give me a yes or no` | 🔴 High |
| Direct confrontation | `Just give me a straight answer` | 🔴 High |
| Direct confrontation | `Simple question — yes or no?` | 🔴 High |
| Impatience | `Just checking in again` | 🟡 Medium |
| Impatience | `Haven't heard back from you` | 🟡 Medium |
| Impatience | `Are you still interested?` | 🟡 Medium |
| Condescension | `Obviously this is the best option` | 🟡 Medium |
| Condescension | `Clearly you should understand` | 🟡 Medium |
| Condescension | `Basically it's simple` | 🟡 Medium |
| Direct disagreement | `I disagree with that approach` | 🔴 High |
| Direct disagreement | `You're wrong about this` | 🔴 High |
| Direct disagreement | `That's incorrect` | 🔴 High |

> Each message fires at most **one** FTA insight. The insight shows the B&L theory label, why it's risky, and a suggested reframe.

---

## 7. Feature Checklist

Use this to verify every feature in sequence during a demo or judging session.

### Pre-Call Cultural Briefing
- [ ] Create a sales room
- [ ] Briefing modal appears automatically before first message
- [ ] Shows flag, context type (High-Context), 4 cultural facts, avoid list, do-this list, watch-for tip
- [ ] Dismiss modal → chat input is available
- [ ] Click **📋 Brief** button in header to re-open it

### Conversation Health Score
- [ ] Health score panel is visible above the right-panel tabs (0–100)
- [ ] Send 3+ messages → score updates
- [ ] Trust / Communication Fit / Engagement bars change as conversation evolves
- [ ] Risk badge shows LOW / MEDIUM / HIGH with color
- [ ] Trend arrow ↑ ↓ → updates over time

### FTA / Politeness Analyzer
- [ ] Type `I need this by Friday` → red **FACE-THREAT** banner in Insights tab
- [ ] Banner shows observation label, B&L theory quote, and suggested reframe
- [ ] Type `Give me a straight answer` → second FTA fires
- [ ] Each message produces at most 1 FTA; benign messages produce none

### Cultural Glossary Viewer
- [ ] Click **Glossary** tab in the right panel
- [ ] See 6–7 terms with labels, phonetics (where applicable), and definitions
- [ ] Terms update correctly per scenario (JP ≠ BR ≠ DE)

### Linguistic DNA Report
- [ ] Click **DNA** tab in the right panel
- [ ] Three dimension bars: Formality / Directness / Face-Saving (0–100)
- [ ] Target markers shown per scenario (e.g. sales target: Formality 70, Directness 30)
- [ ] Talk ratio and average message length shown
- [ ] Gaps and Strengths lists populate after enough messages
- [ ] Footer cites Hall (1976), Brown & Levinson (1987), Hofstede

---

## 8. API Endpoints (Manual Test)

```powershell
# Health check
Invoke-RestMethod http://localhost:3001/health | ConvertTo-Json

# List active rooms
Invoke-RestMethod http://localhost:3001/rooms | ConvertTo-Json

# Get insights for a session (replace SESSION_ID)
Invoke-RestMethod http://localhost:3001/api/insights/SESSION_ID | ConvertTo-Json

# Full report for a session
Invoke-RestMethod http://localhost:3001/api/report/SESSION_ID | ConvertTo-Json
```

---

## 9. Stopping the Servers

```powershell
# Kill all node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

Or press `Ctrl+C` in each terminal.
