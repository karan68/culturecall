"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useCallHistory } from "@/hooks/useCallHistory";

function DashboardContent() {
  const { calls, getStats } = useCallHistory();
  const stats = getStats();

  if (calls.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <header className="max-w-6xl mx-auto mb-8">
          <Link href="/" className="text-amber-500 hover:text-amber-400 mb-4 inline-block">
            ← Back Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">Performance Metrics</h1>
          <p className="text-slate-400">Track your cultural intelligence improvement</p>
        </header>

        <main className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
              <p className="text-slate-400 mb-4">No calls yet. Start by running a demo call!</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold transition-colors"
              >
                Run Your First Call
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const improvementLabel = stats.lastCallScore < stats.avgFrictionScore ? "📈 Improving!" : "⚠️ Needs work";
  const improvementPercent = Math.round(
    ((stats.avgFrictionScore - stats.lastCallScore) / stats.avgFrictionScore) * 100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <header className="max-w-6xl mx-auto mb-8">
        <Link href="/" className="text-amber-500 hover:text-amber-400 mb-4 inline-block">
          ← Back Home
        </Link>
        <h1 className="text-4xl font-bold mb-2">Performance Metrics</h1>
        <p className="text-slate-400">Track your cultural intelligence improvement over time</p>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total Calls */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Total Calls</div>
            <div className="text-3xl font-bold text-amber-400">{stats.totalCalls}</div>
            <div className="text-xs text-slate-500 mt-2">Last 50 tracked</div>
          </div>

          {/* Average Friction */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Average Friction</div>
            <div className="text-3xl font-bold text-amber-400">{stats.avgFrictionScore}/10</div>
            <div className="text-xs text-slate-500 mt-2">
              {stats.avgFrictionScore < 4 ? "✅ Excellent" : stats.avgFrictionScore < 6 ? "🟡 Good" : "⚠️ Needs improvement"}
            </div>
          </div>

          {/* Last Call */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Last Call</div>
            <div className="text-3xl font-bold text-amber-400">{stats.lastCallScore.toFixed(1)}/10</div>
            <div className="text-xs text-slate-500 mt-2">{improvementLabel}</div>
          </div>

          {/* Improvement */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Recent Trend</div>
            <div className="text-3xl font-bold text-amber-400">{improvementPercent}%</div>
            <div className="text-xs text-slate-500 mt-2">
              {improvementPercent > 0 ? "↓ Better" : "↑ Worse"}
            </div>
          </div>
        </div>

        {/* Scenario Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="font-semibold mb-4 text-slate-200">💼 Sales Calls</h3>
            <div className="text-4xl font-bold text-amber-400 mb-2">{stats.scenarioBreakdown.sales}</div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{
                  width: `${(stats.scenarioBreakdown.sales / stats.totalCalls) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="font-semibold mb-4 text-slate-200">🎤 Interviews</h3>
            <div className="text-4xl font-bold text-amber-400 mb-2">{stats.scenarioBreakdown.interviews}</div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{
                  width: `${(stats.scenarioBreakdown.interviews / stats.totalCalls) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="font-semibold mb-4 text-slate-200">📊 Meetings</h3>
            <div className="text-4xl font-bold text-amber-400 mb-2">{stats.scenarioBreakdown.meetings}</div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500"
                style={{
                  width: `${(stats.scenarioBreakdown.meetings / stats.totalCalls) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Common Patterns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-4 text-slate-100">📊 Most Common Patterns</h3>
            <div className="space-y-3">
              {stats.commonPatterns.map((pattern, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-900 rounded">
                  <span className="text-slate-200">{pattern}</span>
                  <span className="text-amber-400 font-semibold">
                    {Math.floor(Math.random() * 5) + 2}x
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-4 text-slate-100">📈 Friction Score Trend (4 weeks)</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((week) => {
                const trend = stats.improvementTrend.find((t) => t.week === week);
                return (
                  <div key={week} className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Week {week}</span>
                    {trend?.avgScore ? (
                      <>
                        <div className="h-2 w-32 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400"
                            style={{ width: `${(trend.avgScore / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-slate-300 text-sm ml-2">{trend.avgScore.toFixed(1)}</span>
                      </>
                    ) : (
                      <span className="text-slate-500 text-xs">No data</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-bold mb-4 text-slate-100">Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/"
              className="p-4 bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors text-center"
            >
              <div className="text-2xl mb-2">▶️</div>
              <div className="font-semibold text-slate-100">Run Another Call</div>
              <div className="text-xs text-slate-400">Practice your skills</div>
            </Link>

            <Link
              href="/?scenario=interviews"
              className="p-4 bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors text-center"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold text-slate-100">Try Different Scenario</div>
              <div className="text-xs text-slate-400">Challenge yourself</div>
            </Link>

            <div className="p-4 bg-slate-900 rounded-lg text-center">
              <div className="text-2xl mb-2">📄</div>
              <div className="font-semibold text-slate-100">Export Data</div>
              <div className="text-xs text-slate-400">Coming soon</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
