"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  role: "rep" | "prospect";
  text: string;
  timestamp: number;
  translatedText?: string;
  detectedLocale?: string;
}

export interface ChatInsight {
  id: string;
  messageId?: string;
  timestamp: number;
  speaker: string;
  senderName?: string;
  observation: string;
  culturalFramework: string;
  suggestedResponse: string;
  severity: "low" | "medium" | "high";
  repAction: string;
  useCase: string;
  source?: "rule" | "groq";
  translatedObservation?: string;
  translatedFramework?: string;
  translatedResponse?: string;
  translationLocale?: string;
}

export interface Participant {
  userId: string;
  name: string;
  role: "rep" | "prospect";
}

type RoomState = "idle" | "creating" | "joining" | "waiting" | "active" | "error";

export const useChatSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState>("idle");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<"rep" | "prospect" | null>(null);
  const [myName, setMyName] = useState<string>("");
  const [scenario, setScenario] = useState<string>("sales");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [insights, setInsights] = useState<ChatInsight[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [partnerOnline, setPartnerOnline] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✓ Chat socket connected");
      setConnected(true);
      setError(null);
    });

    socket.on("disconnect", () => {
      console.log("❌ Chat socket disconnected");
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      setError(`Connection failed: ${err.message}`);
    });

    // ── Room events ──────────────────────────────────────────────────────────

    socket.on("room-created", (data: { roomId: string; scenario: string; userId: string; role: string }) => {
      console.log("🏠 Room created:", data.roomId);
      setRoomId(data.roomId);
      setUserId(data.userId);
      setMyRole(data.role as "rep" | "prospect");
      setScenario(data.scenario);
      setRoomState("waiting");
    });

    socket.on(
      "room-joined",
      (data: { roomId: string; scenario: string; userId: string; role: string; messages: ChatMessage[]; participants: Participant[] }) => {
        console.log("🤝 Joined room:", data.roomId);
        setRoomId(data.roomId);
        setUserId(data.userId);
        setMyRole(data.role as "rep" | "prospect");
        setScenario(data.scenario);
        setMessages(data.messages || []);
        setParticipants(data.participants || []);
        setPartnerOnline(data.participants.length >= 2);
        setRoomState("active");
      }
    );

    socket.on("room-error", (data: { message: string }) => {
      console.error("🚨 Room error:", data.message);
      setError(data.message);
      setRoomState("error");
    });

    socket.on("participant-joined", (data: { userId: string; name: string; role: string; participantCount: number }) => {
      console.log(`👤 ${data.name} joined as ${data.role}`);
      setParticipants((prev) => {
        const exists = prev.find((p) => p.userId === data.userId);
        if (exists) return prev;
        return [...prev, { userId: data.userId, name: data.name, role: data.role as "rep" | "prospect" }];
      });
      setPartnerOnline(true);
      setRoomState("active");
    });

    socket.on("participant-left", (data: { userId: string; name: string; participantCount: number }) => {
      console.log(`👋 ${data.name} left`);
      setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
      setPartnerOnline(false);
    });

    // ── Message & insight events ─────────────────────────────────────────────

    socket.on("chat-message", (message: ChatMessage) => {
      console.log(`💬 Message from ${message.senderName}:`, message.text);
      setMessages((prev) => [...prev, message]);
    });

    socket.on("message-translation", (data: {
      messageId: string;
      translatedText: string | null;
      detectedLocale: string | null;
      sourceLocale: string;
      targetLocale: string;
    }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, translatedText: data.translatedText || undefined, detectedLocale: data.detectedLocale || undefined }
            : msg
        )
      );
    });

    socket.on("insight", (insight: ChatInsight) => {
      console.log(`💡 Insight:`, insight.severity, insight.observation);
      setInsights((prev) => [...prev, insight]);
    });

    socket.on("insight-translation", (data: {
      insightId: string;
      locale: string;
      observation: string;
      culturalFramework: string;
      suggestedResponse: string;
    }) => {
      setInsights((prev) =>
        prev.map((ins) =>
          ins.id === data.insightId
            ? {
                ...ins,
                translatedObservation: data.observation,
                translatedFramework: data.culturalFramework,
                translatedResponse: data.suggestedResponse,
                translationLocale: data.locale,
              }
            : ins
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback((scenarioId: string, role: "rep" | "prospect", name: string) => {
    if (!socketRef.current || !socketRef.current.connected) {
      setError("Not connected to server. Please wait...");
      return;
    }
    setMyName(name);
    setRoomState("creating");
    socketRef.current.emit("create-room", { scenario: scenarioId, role, name });
  }, []);

  const joinRoom = useCallback((roomCode: string, role: "rep" | "prospect", name: string) => {
    if (!socketRef.current || !socketRef.current.connected) {
      setError("Not connected to server. Please wait...");
      return;
    }
    setMyName(name);
    setRoomState("joining");
    socketRef.current.emit("join-room", { roomId: roomCode.toUpperCase(), role, name });
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!socketRef.current || !roomId || !myRole || !userId) return;
      socketRef.current.emit("send-message", {
        roomId,
        text,
        role: myRole,
        name: myName,
        userId,
      });
    },
    [roomId, myRole, myName, userId]
  );

  const resetRoom = useCallback(() => {
    setRoomState("idle");
    setRoomId(null);
    setUserId(null);
    setMyRole(null);
    setMessages([]);
    setInsights([]);
    setParticipants([]);
    setPartnerOnline(false);
    setError(null);
  }, []);

  return {
    connected,
    roomState,
    roomId,
    userId,
    myRole,
    myName,
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
  };
};
