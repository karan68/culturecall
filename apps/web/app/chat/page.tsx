"use client";

import { useState, useEffect, useRef, Suspense, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useChatSocket } from "@/hooks/useChatSocket";
import InsightCard from "@/components/InsightCard";
import CulturalBriefing from "@/components/CulturalBriefing";
import HealthScorePanel from "@/components/HealthScore";
import GlossaryViewer from "@/components/GlossaryViewer";
import LinguisticDNAReport from "@/components/LinguisticDNA";
import { computeHealthScore, computeLinguisticDNA } from "@/utils/linguisticAnalysis";

// ── Script helper data (quick lines for testing) ───────────────────────────

const SCRIPT_LINES: Record<string, { role: "rep" | "prospect"; text: string }[]> = {
  sales: [
    { role: "rep", text: "Good morning! Thank you so much for making time today." },
    { role: "prospect", text: "Good morning. Yes, we are happy to listen." },
    { role: "rep", text: "I'd love to show you what our platform can do. What's your biggest bottleneck right now?" },
    { role: "prospect", text: "Hmm… that is an interesting question. We have many considerations at this stage." },
    { role: "rep", text: "Of course! Would it help if I sent a detailed written proposal you could share internally?" },
    { role: "prospect", text: "We would need to consult with our team and management before deciding." },
    { role: "rep", text: "Absolutely, I completely understand. I'll prepare everything in writing for you." },
    { role: "prospect", text: "Yes, that would be very helpful. Thank you, Jordan-san." },
    { role: "rep", text: "Could we schedule a follow-up call next week to answer any questions?" },
    { role: "prospect", text: "Let me check with my colleagues and we will confirm." },
  ],
  interviews: [
    { role: "rep", text: "Hi! Great to meet you. Walk me through your product management background." },
    { role: "prospect", text: "So happy to be here! Before I dive in – how are you doing today?" },
    { role: "rep", text: "I'm great, thanks! Can you give me the STAR format for a key project?" },
    { role: "prospect", text: "Situation: 40% churn at 3 months. Task: diagnose and fix it. Action: customer interviews + cohort analysis. Result: churn dropped to 18%." },
    { role: "rep", text: "What would you say is your biggest weakness as a PM?" },
    { role: "prospect", text: "I sometimes get too emotionally invested in the user's experience. I care deeply about people." },
    { role: "rep", text: "How do you handle conflict on a cross-functional team?" },
    { role: "prospect", text: "I always start by having a real conversation – not a Slack message. I ask questions and listen deeply." },
    { role: "rep", text: "What metrics do you prioritize?" },
    { role: "prospect", text: "For early stage: activation and D7 retention. Growth stage: expansion revenue and feature adoption depth." },
  ],
  meetings: [
    { role: "rep", text: "Hey team! Really excited about this quarter. Let's kick off the roadmap review!" },
    { role: "prospect", text: "I have reviewed the document and I have several concerns I would like to address." },
    { role: "rep", text: "Absolutely! Can you help me understand the technical constraints?" },
    { role: "prospect", text: "The timeline for Feature B is unrealistic. It needs 6 weeks minimum, not 3." },
    { role: "rep", text: "Fair point – we should loop in engineering earlier. Should we move Feature B to next quarter?" },
    { role: "prospect", text: "That would be the technically correct decision, yes." },
    { role: "rep", text: "We have user research showing 67% of users requested Feature A. I think this is a big win!" },
    { role: "prospect", text: "According to what data?" },
    { role: "rep", text: "We have NPS comments and a 67% request rate from last quarter's survey." },
    { role: "prospect", text: "Good. That is sufficient to prioritize. However, three edge cases are not covered in the PRD." },
  ],
};

const SCENARIO_META = {
  sales: { label: "💼 Sales (EN↔JA)", repLabel: "Sales Rep (EN)", prospectLabel: "Enterprise Buyer (JA)" },
  interviews: { label: "🎓 Interview (EN↔PT-BR)", repLabel: "Interviewer (EN)", prospectLabel: "Candidate (PT-BR)" },
  meetings: { label: "🤝 Meeting (EN↔DE)", repLabel: "Product Manager (EN)", prospectLabel: "Engineer (DE)" },
};

// ── Setup Screen ───────────────────────────────────────────────────────────

function SetupScreen({
  onCreateRoom,
  onJoinRoom,
  initialRoomCode,
  connected,
  error,
}: {
  onCreateRoom: (scenario: string, role: "rep" | "prospect", name: string) => void;
  onJoinRoom: (code: string, role: "rep" | "prospect", name: string) => void;
  initialRoomCode: string;
  connected: boolean;
  error: string | null;
}) {
  const [mode, setMode] = useState<"create" | "join">(initialRoomCode ? "join" : "create");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"rep" | "prospect">("rep");
  const [scenario, setScenario] = useState("sales");
  const [roomCode, setRoomCode] = useState(initialRoomCode);

  const meta = SCENARIO_META[scenario as keyof typeof SCENARIO_META];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌍</div>
          <h1 className="text-3xl font-bold text-white">CultureCall</h1>
          <p className="text-slate-400 mt-1">Real-Time Cultural Intelligence Chat</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-lg overflow-hidden border border-slate-700 mb-6">
          <button
            onClick={() => setMode("create")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mode === "create" ? "bg-amber-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Create Room
          </button>
          <button
            onClick={() => setMode("join")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mode === "join" ? "bg-amber-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Join Room
          </button>
        </div>

        <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-xl p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-semibold">YOUR NAME</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan, Tanaka, Klaus…"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Scenario (create only) */}
          {mode === "create" && (
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">CALL SCENARIO</label>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 appearance-none cursor-pointer"
              >
                <option value="sales">💼 Sales Call (EN ↔ JA)</option>
                <option value="interviews">🎓 Job Interview (EN ↔ PT-BR)</option>
                <option value="meetings">🤝 Team Meeting (EN ↔ DE)</option>
              </select>
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-semibold">YOUR ROLE</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setRole("rep")}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                  role === "rep"
                    ? "bg-amber-500/20 border-amber-500 text-amber-400"
                    : "bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500"
                }`}
              >
                {mode === "create" ? meta.repLabel : "Rep / Interviewer"}
              </button>
              <button
                onClick={() => setRole("prospect")}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                  role === "prospect"
                    ? "bg-amber-500/20 border-amber-500 text-amber-400"
                    : "bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500"
                }`}
              >
                {mode === "create" ? meta.prospectLabel : "Prospect / Candidate"}
              </button>
            </div>
          </div>

          {/* Room Code (join only) */}
          {mode === "join" && (
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">ROOM CODE</label>
              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. AB3X7K"
                maxLength={6}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm font-mono tracking-widest text-center focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-950/50 border border-red-700/50 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Connection status */}
          <div className={`flex items-center gap-2 text-xs ${connected ? "text-green-400" : "text-slate-500"}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-slate-500 animate-pulse"}`} />
            {connected ? "Connected to server" : "Connecting…"}
          </div>

          {/* Submit */}
          <button
            disabled={!name.trim() || !connected || (mode === "join" && roomCode.length < 4)}
            onClick={() => {
              if (mode === "create") onCreateRoom(scenario, role, name.trim());
              else onJoinRoom(roomCode, role, name.trim());
            }}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/30 transition-all"
          >
            {mode === "create" ? "Create Room →" : "Join Room →"}
          </button>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-slate-500 hover:text-slate-400 text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Waiting Screen ─────────────────────────────────────────────────────────

function WaitingScreen({ roomId, scenario, myRole }: { roomId: string; scenario: string; myRole: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/chat?room=${roomId}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const meta = SCENARIO_META[scenario as keyof typeof SCENARIO_META];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="text-6xl mb-6 animate-bounce">⏳</div>
        <h2 className="text-2xl font-bold text-white mb-2">Waiting for partner…</h2>
        <p className="text-slate-400 mb-8">Share the room code with your chat partner</p>

        {/* Room Code */}
        <div className="bg-slate-800/80 border border-amber-500/30 rounded-xl p-6 mb-6">
          <p className="text-xs text-slate-400 mb-2 font-semibold">ROOM CODE</p>
          <div className="text-5xl font-mono font-bold text-amber-400 tracking-widest mb-4">{roomId}</div>
          <div className="space-y-3">
            <button
              onClick={() => { navigator.clipboard.writeText(roomId); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="w-full py-2.5 bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 rounded-lg text-amber-300 font-semibold text-sm transition-colors"
            >
              {copied ? "✓ Copied!" : "Copy Code"}
            </button>
            <button
              onClick={copyLink}
              className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 font-semibold text-sm transition-colors"
            >
              Copy Join Link
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-slate-800/40 rounded-xl p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Scenario:</span>
            <span className="text-white font-semibold">{meta?.label}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Your role:</span>
            <span className="text-amber-400 font-semibold capitalize">{myRole}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-sm">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Listening for connection…
        </div>
      </div>
    </div>
  );
}

// ── Chat Message Bubble ────────────────────────────────────────────────────

function MessageBubble({
  message,
  isMe,
  hasInsight,
}: {
  message: { id: string; senderName: string; role: string; text: string; timestamp: number; translatedText?: string; detectedLocale?: string };
  isMe: boolean;
  hasInsight: boolean;
}) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
        <div className="flex items-center gap-2 mb-1">
          {!isMe && <span className="text-xs text-slate-400 font-semibold">{message.senderName}</span>}
          <span className="text-xs text-slate-500">{message.role}</span>
          {message.detectedLocale && (
            <span className="text-xs text-indigo-400 font-mono">[{message.detectedLocale}]</span>
          )}
          {isMe && <span className="text-xs text-slate-400 font-semibold">You</span>}
        </div>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm relative ${
            isMe
              ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-tr-sm"
              : "bg-slate-700 text-slate-100 rounded-tl-sm"
          } ${hasInsight ? "ring-2 ring-yellow-500/60" : ""}`}
        >
          {message.text}
          {hasInsight && (
            <span className="absolute -top-2 -right-2 text-xs bg-yellow-500 text-slate-900 rounded-full w-5 h-5 flex items-center justify-center font-bold">
              !
            </span>
          )}
        </div>
        {message.translatedText && (
          <div className={`mt-1 px-3 py-1.5 rounded-xl text-xs border ${
            isMe
              ? "bg-amber-950/30 border-amber-700/30 text-amber-200/80"
              : "bg-indigo-950/30 border-indigo-700/30 text-indigo-200/80"
          }`}>
            <span className="text-slate-500 mr-1">🌐</span>
            {message.translatedText}
          </div>
        )}
        <div className="text-xs text-slate-600 mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

// ── Script Helper Panel ────────────────────────────────────────────────────

function ScriptHelper({
  scenario,
  myRole,
  onSelect,
}: {
  scenario: string;
  myRole: "rep" | "prospect";
  onSelect: (text: string) => void;
}) {
  const lines = SCRIPT_LINES[scenario] || [];
  const myLines = lines.filter((l) => l.role === myRole);

  return (
    <div className="absolute bottom-full mb-2 left-0 right-0 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-700 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-semibold">📋 SCRIPT SUGGESTIONS (click to use)</span>
        <span className="text-xs text-slate-500">as {myRole}</span>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {myLines.map((line, i) => (
          <button
            key={i}
            onClick={() => onSelect(line.text)}
            className="w-full text-left px-4 py-2.5 hover:bg-slate-700 text-sm text-slate-300 border-b border-slate-700/50 last:border-0 transition-colors"
          >
            {line.text}
          </button>
        ))}
        {myLines.length === 0 && (
          <div className="px-4 py-3 text-sm text-slate-500">No script lines for your role in this scenario.</div>
        )}
      </div>
    </div>
  );
}

// ── Active Chat Screen ─────────────────────────────────────────────────────

function ActiveChat({
  messages,
  insights,
  participants,
  partnerOnline,
  myUserId,
  myRole,
  scenario,
  onSend,
  onEnd,
}: {
  messages: ReturnType<typeof useChatSocket>["messages"];
  insights: ReturnType<typeof useChatSocket>["insights"];
  participants: ReturnType<typeof useChatSocket>["participants"];
  partnerOnline: boolean;
  myUserId: string;
  myRole: "rep" | "prospect";
  scenario: string;
  onSend: (text: string) => void;
  onEnd: () => void;
}) {
  const [input, setInput] = useState("");
  const [showScript, setShowScript] = useState(false);
  const [showBriefing, setShowBriefing] = useState(true);
  const [rightTab, setRightTab] = useState<"insights" | "glossary" | "dna">("insights");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const meta = SCENARIO_META[scenario as keyof typeof SCENARIO_META];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput("");
    inputRef.current?.focus();
  };

  const insightMessageIds = new Set(insights.map((i) => i.messageId).filter(Boolean));
  const highRiskInsights = insights.filter((i) => i.severity === "high");
  const partner = participants.find((p) => p.role !== myRole);

  // Live computed metrics
  const healthScore = useMemo(() => computeHealthScore(messages, insights), [messages, insights]);
  const dna = useMemo(() => ({ ...computeLinguisticDNA(messages, insights), scenario }), [messages, insights, scenario]);

  const TAB_LABELS = [
    { id: "insights" as const, label: `💡 Insights${insights.length > 0 ? ` (${insights.length})` : ""}` },
    { id: "glossary" as const, label: "📖 Glossary" },
    { id: "dna" as const, label: "🧬 DNA" },
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col text-white">
      {/* Cultural Briefing modal */}
      {showBriefing && <CulturalBriefing scenario={scenario} onDismiss={() => setShowBriefing(false)} />}

      {/* Header */}
      <header className="border-b border-amber-500/20 backdrop-blur-sm px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-xl">🌍</div>
          <div>
            <h1 className="text-sm font-bold">{meta?.label || scenario}</h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className={`w-1.5 h-1.5 rounded-full ${partnerOnline ? "bg-green-400 animate-pulse" : "bg-slate-500"}`} />
              {partnerOnline ? `${partner?.name || "Partner"} online` : "Waiting for partner…"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Inline health badge */}
          <div className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
            healthScore.riskLevel === "low" ? "bg-green-500/10 border-green-500/40 text-green-400" :
            healthScore.riskLevel === "medium" ? "bg-amber-500/10 border-amber-500/40 text-amber-400" :
            "bg-red-500/10 border-red-500/40 text-red-400"
          }`}>
            Health: {healthScore.overall}
          </div>
          <button
            onClick={() => setShowBriefing(true)}
            className="px-2.5 py-1 bg-slate-700/60 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-400 text-xs font-semibold transition-colors"
            title="Re-open cultural briefing"
          >
            📋 Brief
          </button>
          <button onClick={onEnd} className="px-3 py-1.5 bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 rounded-lg text-red-400 text-xs font-semibold transition-colors">
            End
          </button>
        </div>
      </header>

      {/* Critical Alert Banner */}
      {highRiskInsights.length > 0 && (
        <div className="bg-red-950/50 border-b border-red-700/40 px-4 py-2 flex items-center gap-2 flex-shrink-0">
          <span className="text-red-400 text-xs font-bold animate-pulse">⚠️ FACE-THREAT</span>
          <span className="text-red-300 text-xs truncate">{highRiskInsights[highRiskInsights.length - 1]?.observation}</span>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Panel */}
        <div className="flex flex-col flex-1 min-w-0 border-r border-slate-700/50">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-sm">{partnerOnline ? "Say hello! You're both here." : "Waiting for your partner to join…"}</p>
                <p className="text-xs mt-2 text-slate-600">Click 📋 below for test script lines</p>
              </div>
            )}
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMe={msg.senderId === myUserId}
                hasInsight={insightMessageIds.has(msg.id)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="flex-shrink-0 border-t border-slate-700/50 p-3 relative">
            {showScript && (
              <ScriptHelper
                scenario={scenario}
                myRole={myRole}
                onSelect={(text) => { setInput(text); setShowScript(false); inputRef.current?.focus(); }}
              />
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowScript((s) => !s)}
                className={`flex-shrink-0 px-3 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                  showScript ? "bg-amber-500/20 border-amber-500 text-amber-400" : "bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600"
                }`}
                title="Script suggestions"
              >
                📋
              </button>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={partnerOnline ? `Type as ${myRole}…` : "Waiting for partner…"}
                disabled={!partnerOnline}
                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !partnerOnline}
                className="flex-shrink-0 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/30 transition-all"
              >
                Send
              </button>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-600">
              <span>Role: <strong className="text-amber-500">{myRole}</strong></span>
              <span>Enter to send · 📋 for script lines</span>
            </div>
          </div>
        </div>

        {/* Right Panel: tabbed — Insights / Glossary / DNA */}
        <div className="w-80 flex-shrink-0 flex flex-col overflow-hidden">
          {/* Health Score — always visible */}
          <div className="p-3 border-b border-slate-700/50 flex-shrink-0">
            <HealthScorePanel score={healthScore} />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-700/50 flex-shrink-0">
            {TAB_LABELS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightTab(tab.id)}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                  rightTab === tab.id
                    ? "text-amber-400 border-b-2 border-amber-500"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {rightTab === "insights" && (
              insights.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-600 py-8">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-xs">Insights appear as the conversation develops</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...insights].reverse().map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              )
            )}
            {rightTab === "glossary" && <GlossaryViewer scenario={scenario} />}
            {rightTab === "dna" && <LinguisticDNAReport dna={dna} scenario={scenario} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page Component ─────────────────────────────────────────────────────

function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialRoom = searchParams.get("room") || "";

  const {
    connected,
    roomState,
    roomId,
    userId,
    myRole,
    scenario,
    messages,
    insights,
    participants,
    partnerOnline,
    error,
    createRoom,
    joinRoom,
    sendMessage,
    resetRoom,
  } = useChatSocket();

  const handleEnd = useCallback(() => {
    resetRoom();
    router.push("/");
  }, [resetRoom, router]);

  // Setup screen
  if (roomState === "idle" || roomState === "creating" || roomState === "joining" || roomState === "error") {
    return (
      <SetupScreen
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        initialRoomCode={initialRoom}
        connected={connected}
        error={error}
      />
    );
  }

  // Waiting for partner
  if (roomState === "waiting") {
    return (
      <WaitingScreen
        roomId={roomId!}
        scenario={scenario}
        myRole={myRole || "rep"}
      />
    );
  }

  // Active chat
  if (roomState === "active") {
    return (
      <ActiveChat
        messages={messages}
        insights={insights}
        participants={participants}
        partnerOnline={partnerOnline}
        myUserId={userId || ""}
        myRole={myRole || "rep"}
        scenario={scenario}
        onSend={sendMessage}
        onEnd={handleEnd}
      />
    );
  }

  return null;
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4 animate-spin">🌍</div>
          <p>Loading…</p>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
