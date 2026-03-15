"use client";

import { useEffect, useRef } from "react";
import { useUiI18n } from "@/components/UiI18nProvider";

interface TranscriptLine {
  timestamp: number;
  speaker: "rep" | "prospect";
  text: string;
  sourceLanguage: string;
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function TranscriptPanel({
  transcript,
}: {
  transcript: TranscriptLine[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useUiI18n();

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto space-y-4 pr-2 text-sm"
    >
      {transcript.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
          <div className="text-2xl">🎤</div>
          <p>{t("transcript_waiting")}</p>
        </div>
      ) : (
        transcript.map((line, idx) => (
          <div
            key={idx}
            className="group animate-in fade-in slide-in-from-left-2 duration-300"
          >
            {/* Speaker label with avatar */}
            <div className="flex items-start gap-3">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm flex-shrink-0 ${
                  line.speaker === "rep"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                }`}
              >
                {line.speaker === "rep" ? "👤" : "🌐"}
              </div>

              <div className="flex-1 min-w-0">
                {/* Speaker header */}
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-bold uppercase tracking-wide ${
                      line.speaker === "rep"
                        ? "text-blue-300"
                        : "text-purple-300"
                    }`}
                  >
                    {line.speaker === "rep" ? t("transcript_sales_rep") : t("transcript_prospect")}
                  </span>
                  <span className="text-slate-600 text-xs font-mono">
                    {formatTimestamp(line.timestamp)}
                  </span>
                  <span className="text-slate-600 text-xs bg-slate-800/50 px-2 py-0.5 rounded">
                    {line.sourceLanguage.toUpperCase()}
                  </span>
                </div>

                {/* Transcript text */}
                <p className="text-slate-200 leading-relaxed text-sm break-words">
                  {line.text}
                </p>
              </div>
            </div>

            {/* Subtle divider */}
            <div className="mt-3 border-t border-slate-700/30 group-last:border-0" />
          </div>
        ))
      )}
    </div>
  );
}
