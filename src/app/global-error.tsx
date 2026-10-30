"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-[#111d3d] p-8 space-y-4 shadow-2xl">
          <span className="text-4xl">⚠️</span>
          <h2 className="text-xl font-bold text-white">Application Error</h2>
          <p className="text-xs text-slate-300">
            A server error occurred. Please try reloading the page.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-slate-500 bg-slate-900/60 p-2 rounded-lg">
              Digest: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer mt-2"
          >
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}
