"use client";

import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface TranscriptLine {
  timestamp: number;
  speaker: "rep" | "prospect";
  text: string;
  sourceLanguage: string;
  callId?: string;
}

interface Insight {
  id: string;
  timestamp: number;
  speaker: string;
  observation: string;
  culturalFramework: string;
  suggestedResponse: string;
  severity: "low" | "medium" | "high";
  repAction: string;
  useCase: string;
  callId?: string;
}

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [callActive, setCallActive] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("✓ Connected to signaling server");
      setConnected(true);
      setConnectionError(null);
    });

    newSocket.on("transcript-line", (data: TranscriptLine) => {
      console.log("📝 Transcript line received:", data);
      setTranscript((prev) => [...prev, data]);
    });

    newSocket.on("insight", (data: Insight) => {
      console.log("💡 Insight received:", data);
      setInsights((prev) => [...prev, data]);
    });

    newSocket.on("call-started", () => {
      console.log("🎬 Call started");
      setCallActive(true);
      setTranscript([]);
      setInsights([]);
    });

    newSocket.on("call-ended", () => {
      console.log("🏁 Call ended");
      setCallActive(false);
    });

    newSocket.on("error", (err: any) => {
      const errorMessage = err?.message || "Unknown error";
      console.error("🚨 Socket error:", errorMessage);
      setConnectionError(errorMessage);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from signaling server");
      setConnected(false);
    });

    newSocket.on("connect_error", (err: any) => {
      const errorMessage = err?.message || "Connection error";
      console.error("🔌 Connection error:", errorMessage);
      setConnectionError(`Connection failed: ${errorMessage}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const startCall = useCallback(
    (scenario: string, prospectLang: string) => {
      if (!socket || !connected) {
        setConnectionError("Not connected to server. Please wait...");
        return;
      }
      if (socket) {
        socket.emit("start-call", { scenario, prospectLang });
      }
    },
    [socket, connected]
  );

  return {
    socket,
    connected,
    transcript,
    insights,
    callActive,
    startCall,
    connectionError,
  };
};
