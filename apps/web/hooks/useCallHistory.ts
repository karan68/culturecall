import { useEffect, useState } from "react";

export interface CallRecord {
  callId: string;
  timestamp: number;
  scenario: "sales" | "interviews" | "meetings";
  duration: number; // seconds
  insightCount: number;
  frictionScore: number;
  highRiskCount: number;
  coachingPoints: string[];
}

export function useCallHistory() {
  const [calls, setCalls] = useState<CallRecord[]>([]);

  // Load calls from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("culturecall_history");
    if (saved) {
      try {
        setCalls(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading call history:", e);
      }
    }
  }, []);

  // Save a new call
  const saveCall = (call: CallRecord) => {
    const updated = [call, ...calls].slice(0, 50); // Keep last 50 calls
    setCalls(updated);
    localStorage.setItem("culturecall_history", JSON.stringify(updated));
  };

  // Get stats
  const getStats = () => {
    if (calls.length === 0) {
      return {
        totalCalls: 0,
        avgFrictionScore: 0,
        scenarioBreakdown: { sales: 0, interviews: 0, meetings: 0 },
        commonPatterns: [] as string[],
        improvementTrend: [] as { week: number; avgScore: number }[],
        lastCallScore: 0,
      };
    }

    const avgFrictionScore = calls.reduce((sum, c) => sum + c.frictionScore, 0) / calls.length;
    
    const scenarioBreakdown = {
      sales: calls.filter(c => c.scenario === "sales").length,
      interviews: calls.filter(c => c.scenario === "interviews").length,
      meetings: calls.filter(c => c.scenario === "meetings").length,
    };

    // Weekly trend (simplified)
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const improvementTrend = Array.from({ length: 4 }, (_, week) => {
      const weekStart = now - (4 - week) * weekMs;
      const weekEnd = weekStart + weekMs;
      const callsInWeek = calls.filter(c => c.timestamp >= weekStart && c.timestamp < weekEnd);
      
      return {
        week: 4 - week,
        avgScore: callsInWeek.length > 0 
          ? callsInWeek.reduce((sum, c) => sum + c.frictionScore, 0) / callsInWeek.length
          : null,
      };
    }).filter(w => w.avgScore !== null);

    const lastCallScore = calls.length > 0 ? calls[0].frictionScore : 0;

    return {
      totalCalls: calls.length,
      avgFrictionScore: Math.round(avgFrictionScore * 10) / 10,
      scenarioBreakdown,
      commonPatterns: ["Group decision-making", "Direct feedback", "Context importance"],
      improvementTrend,
      lastCallScore,
    };
  };

  return {
    calls,
    saveCall,
    getStats,
  };
}
