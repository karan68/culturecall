import dotenv from "dotenv";
import path from "path";

// Load environment variables BEFORE any other imports
// Try .env.local first, then fall back to .env
const envPath = path.join(process.cwd(), "..", "..", ".env.local");
const envPathFallback = path.join(process.cwd(), ".env");

try {
  const result = dotenv.config({ path: envPath });
  if (!result.parsed) {
    console.log(`ℹ️  .env.local not found at ${envPath}, trying default .env`);
    dotenv.config({ path: envPathFallback });
  }
} catch (e) {
  console.error("Error loading env:", e);
  dotenv.config();
}

import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { loadGlossaries, getGlossary, searchGlossary } from "./services/glossary-service.js";
import { analyzeCulturalContext } from "./services/groq-service.js";
import { generatePDFReport } from "./services/reportGenerator.js";
import { detectLanguage, translateMessage, translateInsight, translateTranscript } from "./services/lingo-translation-service.js";
import fs from "fs";

// Environment validation
function validateEnvironment(): void {
  const requiredEnvVars: string[] = [];
  if (process.env.GROQ_ENABLED === "true" && !process.env.GROQ_API_KEY) {
    requiredEnvVars.push("GROQ_API_KEY");
  }

  if (requiredEnvVars.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${requiredEnvVars.join(", ")}`);
    console.warn(`💡 Features depending on these will be skipped.`);
  }
  console.log(`✓ Environment validated`);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Startup sequence with async initialization
(async () => {
  try {
    console.log(`🚀 Starting CultureCall signaling server...`);
    validateEnvironment();
    await loadGlossaries();
  } catch (error) {
    console.error(`❌ Startup error:`, error);
    process.exit(1);
  }
})();

// Middleware
app.use(cors());
app.use(express.json());

interface TranscriptLine {
  timestamp: number;
  speaker: "rep" | "prospect";
  text: string;
  sourceLanguage: string;
}

interface CallSession {
  id: string;
  scenario: string;
  prospectLanguage: string;
  transcript: TranscriptLine[];
  insightCount: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  role: "rep" | "prospect";
  text: string;
  timestamp: number;
  translatedText?: string;
  detectedLocale?: string;
}

interface Participant {
  socketId: string;
  role: "rep" | "prospect";
  name: string;
}

interface ChatRoom {
  id: string;
  scenario: string;
  participants: Map<string, Participant>;
  messages: ChatMessage[];
  insightCount: number;
  createdAt: number;
}

// Store active sessions
const activeSessions = new Map<string, CallSession>();
// Store active chat rooms
const chatRooms = new Map<string, ChatRoom>();

// Generate a short readable room ID
function generateRoomId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    activeSessions: activeSessions.size,
    activeChatRooms: chatRooms.size,
    groqEnabled: process.env.GROQ_ENABLED === "true",
  });
});

// PDF Report Generation Endpoint
app.post("/api/report/generate", express.json(), async (req, res) => {
  try {
    const { callData, insights } = req.body;

    if (!callData || !insights) {
      return res.status(400).json({
        error: "Missing callData or insights",
      });
    }

    console.log(`📄 Generating PDF report for call ${callData.callId}`);

    // Generate bilingual transcript using Lingo.dev localizeChat
    if (callData.transcript?.length > 0 && callData.culturePair) {
      const [srcLang, tgtLang] = callData.culturePair.split("-");
      if (srcLang && tgtLang) {
        try {
          const chatItems = callData.transcript.map((line: { speaker: string; text: string }) => ({
            name: line.speaker === "rep" ? "Rep" : "Prospect",
            text: line.text,
          }));
          const translated = await translateTranscript(chatItems, srcLang, tgtLang);
          if (translated) {
            callData.bilingualTranscript = callData.transcript.map(
              (line: { speaker: string; text: string; timestamp: number }, i: number) => ({
                speaker: line.speaker,
                text: line.text,
                translatedText: translated[i]?.text || line.text,
                timestamp: line.timestamp,
              })
            );
            console.log(`🌐 Bilingual transcript generated via Lingo.dev localizeChat`);
          }
        } catch (err) {
          console.warn("Bilingual transcript generation skipped:", (err as Error).message);
        }
      }
    }

    const pdfBuffer = await generatePDFReport(callData, insights);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="culturecall-report-${callData.callId}.pdf"`
    );
    res.send(pdfBuffer);

    console.log(`✓ PDF report generated and sent (${pdfBuffer.length} bytes)`);
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    res.status(500).json({
      error: "Failed to generate PDF report",
      message: (error as Error).message,
    });
  }
});

// Load demo transcript for the given scenario
function loadDemoTranscript(scenario?: string): TranscriptLine[] {
  // Try scenario-specific test script first
  if (scenario) {
    const scriptMap: Record<string, string> = {
      sales: "sales-en-ja.json",
      interviews: "interview-en-pt-br.json",
      meetings: "meeting-en-de.json",
    };
    const scriptFile = scriptMap[scenario];
    if (scriptFile) {
      // Try relative to workspace root (apps/web/public/test-scripts/)
      const scriptPaths = [
        path.join(process.cwd(), "..", "web", "public", "test-scripts", scriptFile),
        path.join(process.cwd(), "public", "test-scripts", scriptFile),
      ];
      for (const sp of scriptPaths) {
        if (fs.existsSync(sp)) {
          try {
            const data = JSON.parse(fs.readFileSync(sp, "utf-8"));
            if (data.messages && Array.isArray(data.messages)) {
              const langMap: Record<string, string> = {
                sales: "ja",
                interviews: "pt-BR",
                meetings: "de",
              };
              const prospectLang = langMap[scenario] || "en";
              console.log(`✓ Loaded scenario transcript: ${scriptFile} (${data.messages.length} lines)`);
              return data.messages.map((msg: { role: string; text: string }, i: number) => ({
                timestamp: i * 4,
                speaker: msg.role === "rep" ? "rep" : "prospect",
                text: msg.text,
                sourceLanguage: msg.role === "rep" ? "en" : prospectLang,
              }));
            }
          } catch (e) {
            console.warn(`Failed to parse ${sp}:`, e);
          }
        }
      }
    }
  }

  // Fallback: try generic demo-transcript.json
  try {
    const filePath = path.join(process.cwd(), "public", "demo-transcript.json");
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch (error) {
    console.error("Error loading demo transcript:", error);
  }

  // Fallback demo transcript
  return [
    {
      timestamp: 0,
      speaker: "rep",
      text: "Good morning! Thank you for taking the time to meet with me today.",
      sourceLanguage: "en",
    },
    {
      timestamp: 3,
      speaker: "prospect",
      text: "Yes, of course. We're interested in your solution.",
      sourceLanguage: "ja",
    },
    {
      timestamp: 7,
      speaker: "rep",
      text: "Great! I'd love to tell you about how our product can help your team.",
      sourceLanguage: "en",
    },
    {
      timestamp: 10,
      speaker: "prospect",
      text: "That's interesting. We would need to consult internally first.",
      sourceLanguage: "ja",
    },
    {
      timestamp: 15,
      speaker: "rep",
      text: "Of course! What's your timeline for making a decision?",
      sourceLanguage: "en",
    },
    {
      timestamp: 18,
      speaker: "prospect",
      text: "Hmm, we need to discuss this with our team and management.",
      sourceLanguage: "ja",
    },
    {
      timestamp: 22,
      speaker: "rep",
      text: "Absolutely. Let me send you a detailed proposal in writing.",
      sourceLanguage: "en",
    },
    {
      timestamp: 26,
      speaker: "rep",
      text: "You can review it with your colleagues and we can follow up next week.",
      sourceLanguage: "en",
    },
    {
      timestamp: 30,
      speaker: "prospect",
      text: "Yes, that would be very helpful. Thank you.",
      sourceLanguage: "ja",
    },
  ];
}

// Socket.io event handlers
io.on("connection", (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("start-call", async (data: { scenario: string; prospectLang: string }, callback) => {
    try {
      const callId = `call-${Date.now()}`;
      const session: CallSession = {
        id: callId,
        scenario: data.scenario,
        prospectLanguage: data.prospectLang || "ja",
        transcript: [],
        insightCount: 0,
      };

      activeSessions.set(callId, session);
      console.log(`📱 Call started: ${callId} (${data.scenario} → ${data.prospectLang})`);
      socket.emit("call-started", { callId, timestamp: Date.now() });

    // Load demo transcript and stream it
    const transcript = loadDemoTranscript(data.scenario);

    // Stream transcript with insights
    for (let i = 0; i < transcript.length; i++) {
      const line = transcript[i];
      session.transcript.push(line);

      // Wait a bit before sending (simulate real-time)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Emit transcript line
      socket.emit("transcript-line", {
        ...line,
        callId,
      });

      // Generate insight for each line
      {
        const glossary = getGlossary(data.scenario);

        // FTA detection on rep lines
        if (line.speaker === "rep") {
          const ftaPatterns: { pattern: RegExp; label: string; theory: string; fix: string; severity: "low" | "medium" | "high" }[] = [
            {
              pattern: /\b(?:(?:I|we)\s+(?:need|require|must have|demand)\b.{0,30}?\b(?:by\s+(?:monday|tuesday|wednesday|thursday|friday|today|tomorrow|end of (?:day|week))|asap|immediately|right now|urgently)\b|(?:(?:need|require|must have)\s+(?:this|it|a decision|an answer)\s+(?:asap|immediately|right now|urgently)))/i,
              label: "Urgency imposition detected",
              theory: "Negative Face Threat (Brown & Levinson): Direct deadline pressure threatens autonomy.",
              fix: 'Soften to: "What timeline works for your team?"',
              severity: "high",
            },
            {
              pattern: /\b(yes or no|simple question|just (say|tell me|answer)|give me a straight answer)\b/i,
              label: "Direct confrontation style",
              theory: "Negative Face Threat: Demanding binary clarity suppresses high-context indirect communication.",
              fix: 'Use: "Help me understand your perspective" instead.',
              severity: "high",
            },
          ];
          for (const fta of ftaPatterns) {
            if (fta.pattern.test(line.text)) {
              const ftaInsight = {
                id: `fta-${session.insightCount++}`,
                timestamp: line.timestamp,
                speaker: line.speaker,
                observation: fta.label,
                culturalFramework: fta.theory,
                suggestedResponse: fta.fix,
                severity: fta.severity,
                repAction: fta.fix,
                useCase: data.scenario,
                source: "politeness",
              };
              socket.emit("insight", ftaInsight);
              console.log(`🎭 [${callId}] FTA detected: ${fta.label}`);
              break;
            }
          }
        }

        // Rule-based glossary matching
        const ruleMatch = searchGlossary(line.text, glossary);

        if (ruleMatch) {
          const insight = {
            id: `insight-${session.insightCount++}`,
            timestamp: line.timestamp,
            speaker: line.speaker,
            observation: ruleMatch.observation,
            culturalFramework: ruleMatch.culturalFramework,
            suggestedResponse: ruleMatch.tacticResponse,
            severity: ruleMatch.severity,
            repAction: ruleMatch.repAction,
            useCase: data.scenario,
          };

          socket.emit("insight", insight);
          session.insightCount++;

          // Optional: Also call Groq for deeper analysis (LLM fallback)
          if (process.env.GROQ_ENABLED === "true") {
            try {
              const llmInsight = await analyzeCulturalContext({
                transcript: line.text,
                culturePair: `en-${data.prospectLang}`,
                glossary,
                useCase: (data.scenario as "sales" | "interviews" | "meetings"),
              });
              console.log(`🤖 LLM analysis for insight ${insight.id}`);
            } catch (error) {
              console.error(`❌ Groq error (non-blocking):`, error);
            }
          }
        }
      }
    }
      // End call
      console.log(`✓ Call ended: ${callId} (${session.insightCount} insights)`);
      socket.emit("call-ended", { callId, totalLines: session.transcript.length });
    } catch (error) {
      console.error(`❌ Error in start-call handler:`, error);
      socket.emit("error", { message: "Internal server error", code: "CALL_ERROR" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);

    // Remove participant from any chat rooms they were in
    for (const [roomId, room] of chatRooms.entries()) {
      for (const [userId, participant] of room.participants.entries()) {
        if (participant.socketId === socket.id) {
          room.participants.delete(userId);
          io.to(roomId).emit("participant-left", {
            userId,
            name: participant.name,
            role: participant.role,
            participantCount: room.participants.size,
          });
          console.log(`👋 ${participant.name} left room ${roomId}`);

          // Clean up empty rooms after delay
          if (room.participants.size === 0) {
            setTimeout(() => {
              if (chatRooms.get(roomId)?.participants.size === 0) {
                chatRooms.delete(roomId);
                console.log(`🗑️ Room ${roomId} deleted (empty)`);
              }
            }, 30000);
          }
          break;
        }
      }
    }
  });

  // ─── CHAT ROOM EVENTS ────────────────────────────────────────────────────────

  socket.on("create-room", (data: { scenario: string; role: "rep" | "prospect"; name: string }) => {
    let roomId = generateRoomId();
    // Ensure unique ID
    while (chatRooms.has(roomId)) roomId = generateRoomId();

    const userId = `user-${socket.id}`;
    const room: ChatRoom = {
      id: roomId,
      scenario: data.scenario,
      participants: new Map([[userId, { socketId: socket.id, role: data.role, name: data.name }]]),
      messages: [],
      insightCount: 0,
      createdAt: Date.now(),
    };

    chatRooms.set(roomId, room);
    socket.join(roomId);

    console.log(`🏠 Room created: ${roomId} by ${data.name} (${data.role}, scenario: ${data.scenario})`);

    socket.emit("room-created", {
      roomId,
      scenario: data.scenario,
      userId,
      role: data.role,
      participantCount: 1,
    });
  });

  socket.on("join-room", (data: { roomId: string; role: "rep" | "prospect"; name: string }) => {
    const room = chatRooms.get(data.roomId);

    if (!room) {
      socket.emit("room-error", { message: `Room ${data.roomId} not found. Check the code and try again.` });
      return;
    }

    if (room.participants.size >= 2) {
      socket.emit("room-error", { message: "This room already has 2 participants." });
      return;
    }

    // Check role conflict
    const existingRoles = Array.from(room.participants.values()).map((p) => p.role);
    if (existingRoles.includes(data.role)) {
      // Auto-assign the other role
      data.role = data.role === "rep" ? "prospect" : "rep";
    }

    const userId = `user-${socket.id}`;
    room.participants.set(userId, { socketId: socket.id, role: data.role, name: data.name });
    socket.join(data.roomId);

    console.log(`🤝 ${data.name} joined room ${data.roomId} as ${data.role}`);

    // Tell the joiner about the room state
    socket.emit("room-joined", {
      roomId: data.roomId,
      scenario: room.scenario,
      userId,
      role: data.role,
      messages: room.messages,
      participants: Array.from(room.participants.entries()).map(([id, p]) => ({
        userId: id, name: p.name, role: p.role,
      })),
    });

    // Tell existing participants someone joined
    socket.to(data.roomId).emit("participant-joined", {
      userId,
      name: data.name,
      role: data.role,
      participantCount: room.participants.size,
    });
  });

  socket.on(
    "send-message",
    async (data: { roomId: string; text: string; role: "rep" | "prospect"; name: string; userId: string }) => {
      const room = chatRooms.get(data.roomId);
      if (!room) {
        socket.emit("room-error", { message: "Room not found" });
        return;
      }

      const message: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        senderId: data.userId,
        senderName: data.name,
        role: data.role,
        text: data.text,
        timestamp: Date.now(),
      };

      room.messages.push(message);

      // Broadcast original message immediately (low latency)
      io.to(data.roomId).emit("chat-message", message);

      console.log(`💬 [${data.roomId}] ${data.name} (${data.role}): ${data.text.slice(0, 60)}`);

      // ── Lingo.dev: live translation + language detection (async) ──────────
      const scenarioLocales: Record<string, { rep: string; prospect: string }> = {
        sales: { rep: "en", prospect: "ja" },
        interviews: { rep: "en", prospect: "pt-BR" },
        meetings: { rep: "en", prospect: "de" },
      };
      const locales = scenarioLocales[room.scenario] || { rep: "en", prospect: "en" };
      const sourceLocale = data.role === "rep" ? locales.rep : locales.prospect;
      const targetLocale = data.role === "rep" ? locales.prospect : locales.rep;

      Promise.all([
        translateMessage(data.text, sourceLocale, targetLocale),
        detectLanguage(data.text),
      ])
        .then(([translated, detected]) => {
          if (translated || detected) {
            io.to(data.roomId).emit("message-translation", {
              messageId: message.id,
              translatedText: translated,
              detectedLocale: detected,
              sourceLocale,
              targetLocale,
            });
            console.log(`🌐 [${data.roomId}] Translation: ${sourceLocale}→${targetLocale}${detected ? ` (detected: ${detected})` : ""}`);
          }

          // ── Post-translation glossary matching ──────────────────────────
          // If the original message was non-English, match glossary triggers
          // against the English translation so cultural cues aren't missed.
          if (translated && sourceLocale !== "en" && targetLocale === "en") {
            try {
              const glossary = getGlossary(room.scenario);
              const ruleMatch = searchGlossary(translated, glossary);
              if (ruleMatch) {
                const insight = {
                  id: `insight-${room.insightCount++}`,
                  messageId: message.id,
                  timestamp: message.timestamp,
                  speaker: data.role,
                  senderName: data.name,
                  observation: ruleMatch.observation,
                  culturalFramework: ruleMatch.culturalFramework,
                  suggestedResponse: ruleMatch.tacticResponse,
                  severity: ruleMatch.severity,
                  repAction: ruleMatch.repAction,
                  useCase: room.scenario,
                };
                io.to(data.roomId).emit("insight", insight);

                const prospectLocale = (scenarioLocales[room.scenario] || { prospect: "en" }).prospect;
                if (prospectLocale !== "en") {
                  translateInsight(insight, prospectLocale)
                    .then((t) => {
                      if (t) {
                        io.to(data.roomId).emit("insight-translation", {
                          insightId: insight.id,
                          locale: prospectLocale,
                          ...t,
                        });
                      }
                    })
                    .catch(() => {});
                }

                console.log(`💡 [${data.roomId}] Translated-text insight: ${ruleMatch.severity} - ${ruleMatch.observation.slice(0, 60)}`);
              }
            } catch (e) {
              console.error("Post-translation glossary error:", e);
            }
          }
        })
        .catch((err) => console.error("Translation error (non-blocking):", err));

      // ── Politeness / Face-Threat Act Detection (Brown & Levinson) ──────────
      const ftaPatterns: { pattern: RegExp; label: string; theory: string; fix: string; severity: "low" | "medium" | "high" }[] = [
        {
          pattern: /\b(?:(?:I|we)\s+(?:need|require|must have|demand)\b.{0,30}?\b(?:by\s+(?:monday|tuesday|wednesday|thursday|friday|today|tomorrow|end of (?:day|week))|asap|immediately|right now|urgently)\b|(?:(?:need|require|must have)\s+(?:this|it|a decision|an answer)\s+(?:asap|immediately|right now|urgently)))/i,
          label: "Urgency imposition detected",
          theory: "Negative Face Threat (Brown & Levinson): Direct deadline pressure threatens autonomy.",
          fix: 'Soften to: "What timeline works for your team?"',
          severity: "high",
        },
        {
          pattern: /\bjust (call me|use my first name|be (direct|honest|blunt|straightforward))\b/i,
          label: "Formality override attempt",
          theory: "Face-Threatening Act: Forcing informality can signal disrespect in high-context cultures.",
          fix: "Let the other party set the formality register.",
          severity: "medium",
        },
        {
          pattern: /\b(yes or no|simple question|just (say|tell me|answer)|give me a straight answer)\b/i,
          label: "Direct confrontation style",
          theory: "Negative Face Threat: Demanding binary clarity suppresses high-context indirect communication.",
          fix: 'Use: "Help me understand your perspective" instead.',
          severity: "high",
        },
        {
          pattern: /\b(are you still (there|interested|on board)|haven't heard back|following up again|just checking)\b/i,
          label: "Impatience signal",
          theory: "Positive Face Threat: Repeated follow-ups imply distrust or disrespect for their process.",
          fix: "One follow-up max. Silence may indicate active consideration, not disengagement.",
          severity: "medium",
        },
        {
          pattern: /\b(obviously|clearly|simply|of course you|you should (know|understand)|basic(ally)?)\b/i,
          label: "Condescension risk",
          theory: "Positive Face Threat: Words implying obvious knowledge threaten the partner's positive face.",
          fix: "Avoid assuming shared common ground across cultures.",
          severity: "medium",
        },
        {
          pattern: /\b(i disagree|you're wrong|that's incorrect|not true|that's a mistake)\b/i,
          label: "Direct disagreement",
          theory: "Face-Threatening Act: Unmitigated disagreement is face-damaging in high-context cultures.",
          fix: 'Use: "I see this differently — may I share another perspective?"',
          severity: "high",
        },
      ];

      for (const fta of ftaPatterns) {
        if (fta.pattern.test(data.text)) {
          const ftaInsight = {
            id: `fta-${room.insightCount++}`,
            messageId: message.id,
            timestamp: message.timestamp,
            speaker: data.role,
            senderName: data.name,
            observation: fta.label,
            culturalFramework: fta.theory,
            suggestedResponse: fta.fix,
            severity: fta.severity,
            repAction: fta.fix,
            useCase: room.scenario,
            source: "politeness",
          };
          io.to(data.roomId).emit("insight", ftaInsight);

          // Lingo.dev: translate insight for prospect's language
          const prospectLocale = (scenarioLocales[room.scenario] || { prospect: "en" }).prospect;
          if (prospectLocale !== "en") {
            translateInsight(ftaInsight, prospectLocale)
              .then((translated) => {
                if (translated) {
                  io.to(data.roomId).emit("insight-translation", {
                    insightId: ftaInsight.id,
                    locale: prospectLocale,
                    ...translated,
                  });
                }
              })
              .catch(() => {});
          }

          console.log(`🎭 [${data.roomId}] FTA detected: ${fta.label}`);
          break; // One FTA insight per message max
        }
      }

      // ── Analyze message for cultural insights ──────────────────────────────
      try {
        const glossary = getGlossary(room.scenario);

        // Rule-based matching (fast)
        const ruleMatch = searchGlossary(data.text, glossary);

        if (ruleMatch) {
          const insight = {
            id: `insight-${room.insightCount++}`,
            messageId: message.id,
            timestamp: message.timestamp,
            speaker: data.role,
            senderName: data.name,
            observation: ruleMatch.observation,
            culturalFramework: ruleMatch.culturalFramework,
            suggestedResponse: ruleMatch.tacticResponse,
            severity: ruleMatch.severity,
            repAction: ruleMatch.repAction,
            useCase: room.scenario,
          };

          io.to(data.roomId).emit("insight", insight);

          // Lingo.dev: translate insight for prospect's language
          const ruleProspectLocale = (scenarioLocales[room.scenario] || { prospect: "en" }).prospect;
          if (ruleProspectLocale !== "en") {
            translateInsight(insight, ruleProspectLocale)
              .then((translated) => {
                if (translated) {
                  io.to(data.roomId).emit("insight-translation", {
                    insightId: insight.id,
                    locale: ruleProspectLocale,
                    ...translated,
                  });
                }
              })
              .catch(() => {});
          }

          console.log(`💡 [${data.roomId}] Insight triggered: ${ruleMatch.severity} - ${ruleMatch.observation.slice(0, 60)}`);
        }

        // LLM analysis with Groq (async, non-blocking)
        if (process.env.GROQ_ENABLED === "true") {
          analyzeCulturalContext({
            transcript: data.text,
            culturePair: room.scenario === "sales" ? "en-ja" : room.scenario === "interviews" ? "en-pt-br" : "en-de",
            glossary,
            useCase: room.scenario as "sales" | "interviews" | "meetings",
          })
            .then((llmResult) => {
              const fallbackPhrases = ["Call analyzed using rule-based", "Analysis complete", "Monitor for cultural cues", "Continue conversation"];
              const isFallback = fallbackPhrases.some(p => llmResult.insight.includes(p));
              if (llmResult && llmResult.insight && !isFallback) {
                const llmInsight = {
                  id: `llm-${room.insightCount++}`,
                  messageId: message.id,
                  timestamp: message.timestamp,
                  speaker: data.role,
                  senderName: data.name,
                  observation: llmResult.insight,
                  culturalFramework: "Groq AI Analysis",
                  suggestedResponse: llmResult.recommendation || "",
                  severity: llmResult.severity || "medium",
                  repAction: llmResult.recommendation || "",
                  useCase: room.scenario,
                  source: "groq",
                };
                io.to(data.roomId).emit("insight", llmInsight);
                console.log(`🤖 [${data.roomId}] Groq insight: ${llmResult.insight.slice(0, 80)}`);
              } else if (isFallback) {
                console.log(`🤖 [${data.roomId}] Groq returned fallback, skipped`);
              }
            })
            .catch((err) => console.error(`🤖 [${data.roomId}] Groq analysis error:`, err.message || err));
        }
      } catch (err) {
        console.error("Analysis error:", err);
      }
    }
  );

});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Signaling server listening on port ${PORT}`);
  console.log(`Socket.io ready for connections`);
});
