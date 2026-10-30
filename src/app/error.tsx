"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Application Error]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col items-center justify-center p-6 text-center selection:bg-emerald-500 selection:text-slate-950">
      <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-[#111d3d] p-8 space-y-5 shadow-2xl">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-xl font-bold text-white">Something went wrong</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          An error occurred while loading this section. You can try refreshing or return to the main page.
        </p>
        {error.digest && (
          <p className="text-[10px] font-mono text-slate-500 bg-slate-900/60 p-2 rounded-lg break-all">
            Error digest: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors inline-block"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
