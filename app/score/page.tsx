"use client";

import React, { useState, useEffect, useRef, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const DATA = {
  streakDays: 6,
  timeToday: "15m",
  baseScore: 952,
  updatedScore: 1074,
  breakdown: [
    { label: "Completed DTE", value: 100 },
    { label: "DTE Streak Multiplier", value: 7 },
    { label: "Correct Knowledge Check Answer", value: 15 },
  ],
  totalDelta: 122,
};

export default function ScoreUpdating({ expanded = false }: { expanded?: boolean }) {
  // default -> collapsed
  const [isExpanded, setIsExpanded] = useState<boolean>(expanded);

  // keep in sync if parent changes prop after mount
  useEffect(() => {
    setIsExpanded(expanded);
  }, [expanded]);

  const {
    streakDays,
    timeToday,
    baseScore,
    updatedScore,
    breakdown,
    totalDelta,
  } = DATA;

  // ref for tile to detect outside clicks
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent | globalThis.MouseEvent) => {
      const target = e.target as Node | null;
      if (!cardRef.current) return;
      if (!cardRef.current.contains(target) && isExpanded) {
        setIsExpanded(false);
      }
    };

    // use mousedown so it collapses promptly before other click handlers
    document.addEventListener("mousedown", handleOutside as EventListener);
    return () => document.removeEventListener("mousedown", handleOutside as EventListener);
  }, [isExpanded]);

  // Toggle when user clicks the score tile wrapper
  const onCardClick = () => setIsExpanded((s) => !s);

  // Prevent clicks on inner interactive elements (like Next) from toggling the card
  const stopToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#071025]">
      <div
        className="w-[380px] h-[812px] rounded-3xl overflow-hidden relative shadow-2xl"
        aria-hidden={false}
      >
        {/* background gradient + subtle texture */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(500px 200px at 15% 10%, rgba(90,110,180,0.12), transparent 12%), radial-gradient(500px 240px at 85% 30%, rgba(160,90,210,0.08), transparent 10%), linear-gradient(180deg,#0b1220 0%, #071025 40%, #030410 100%)",
            mixBlendMode: "screen",
          }}
        />
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Top safe area */}
          <div className="pt-5 px-6">
            <div className="h-3" />
          </div>

          {/* Hero */}
          <div className="flex-1 px-6 flex flex-col items-center justify-start text-center">
            <div className="pt-8" />

            {/* celebratory illustration */}
            <div className="w-[160px] h-[140px] flex items-center justify-center mb-6 pointer-events-auto">
              <svg viewBox="0 0 160 140" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#8b5cf6" />
                    <stop offset="1" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>

                {/* cone shape */}
                <path d="M40 20 L120 20 L100 90 Q80 120 60 90 Z" fill="url(#g1)" opacity={isExpanded ? 1 : 0.9} transform="translate(0,8) rotate(-12 80 60)" />
                {/* confetti pieces */}
                <circle cx="30" cy="18" r="4" fill="#f472b6" />
                <rect x="120" y="10" width="6" height="10" rx="2" fill="#facc15" transform="rotate(20 123 15)" />
                <path d="M110 30 L115 38" stroke="#60a5fa" strokeWidth={3} strokeLinecap="round" />
                <path d="M85 4 L90 14" stroke="#60e9a8" strokeWidth={3} strokeLinecap="round" />
              </svg>
            </div>

            <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
              {isExpanded ? "You Did It!" : "You've completed today's DTE."}
            </h2>

            <p className="text-sm text-white/80 max-w-[300px] mb-6">
              You&apos;ve completed today&apos;s DTE. Your metrics have now changed!
            </p>

            {/* Active streak card */}
            <div className="w-full max-w-[320px] bg-black/40 border border-white/6 rounded-xl p-4 mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/80">Active Streak</div>
                  <div className="text-[12px] text-white/70">Time spent today:</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/5 px-2 py-1 rounded-md text-xs text-white/90 flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-orange-400" />
                    <strong className="text-white">{streakDays} days</strong>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-sm text-white/60 flex justify-end">{timeToday}</div>
            </div>

            {/* Score card - clickable to toggle expand/collapse */}
            <div
              ref={cardRef}
              onClick={onCardClick}
              className="w-full max-w-[320px] rounded-xl bg-gradient-to-b from-[#190f2a]/60 to-[#0b0b12]/60 border border-white/10 shadow-lg overflow-hidden cursor-pointer"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#6d28d9] to-[#3b82f6] rounded-md flex items-center justify-center text-white font-bold">H</div>
                    <div>
                      <div className="text-sm text-white/80">HITE Score</div>
                      <div className="text-xs text-white/60 inline-flex items-center gap-2">
                        <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px]">Rookie</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-2xl font-extrabold text-white">{isExpanded ? updatedScore : baseScore}</div>
                </div>

                
              </div>

              {/* animated breakdown area */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    key="breakdown"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="px-4 pb-4"
                  >
                    <div className="mt-2 text-sm text-white/70 pb-2 border-t border-white/6 pt-3">
                      {breakdown.map((b, i) => (
                        <div className="flex justify-between items-center py-1" key={i}>
                          <div className="text-xs">{b.label}</div>
                          <div className="text-sm font-medium">+{b.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/6 px-0">
                      <div className="text-sm text-white/70">Total</div>
                      <div className="text-sm font-semibold text-emerald-400">+{totalDelta} points</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1" />
          </div>

          {/* Bottom area with Next button */}
          <div className="px-6 pb-8">
            <Link
              href='/feedback'
              className="flex justify-center mx-auto  py-4 font-medium text-lg"
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
