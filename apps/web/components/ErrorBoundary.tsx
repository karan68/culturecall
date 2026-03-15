"use client";

import { ReactNode, useState, useEffect } from "react";

export default function ErrorBoundary({ children }: { children: ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);
      console.error("🚨 Error caught by boundary:", event.error);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-red-950/20 border border-red-700/40 rounded-lg p-6 max-w-md">
          <h1 className="text-red-300 text-lg font-bold mb-2">⚠️ Something went wrong</h1>
          <p className="text-slate-300 text-sm mb-4">
            {error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => {
              setHasError(false);
              setError(null);
              window.location.reload();
            }}
            className="w-full bg-red-700/40 hover:bg-red-700/60 text-red-200 font-semibold py-2 rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
