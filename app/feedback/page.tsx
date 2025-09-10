"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec"; 
// replace with your deployed Apps Script web app URL

export default function FeedbackScreen() {
  const router = useRouter();

  // Step management
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: star ratings (1..5). 0 = not selected.
  const [ratingHelpfulness, setRatingHelpfulness] = useState(0);
  const [ratingEngagement, setRatingEngagement] = useState(0);

  // Step 2 fields
  const lengthOptions = ["Too Long", "Just Right", "Too Short"];
  const [lengthChoice, setLengthChoice] = useState<string | null>(null);
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null);
  const [freeText, setFreeText] = useState("");
  const [name, setName] = useState("");

  const canGoToStep2 = ratingHelpfulness > 0 && ratingEngagement > 0;
  const canSubmit = lengthChoice !== null && daysPerWeek !== null;

  const handleFinalSubmit = async () => {
    if (!canSubmit) return;

    const payload = {
      ratings: {
        helpfulness: ratingHelpfulness,
        engagement: ratingEngagement,
      },
      feedback: {
        lengthChoice,
        daysPerWeek,
        freeText,
        name,
      },
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Error sending to Google Sheet:", err);
    }

    router.push("/dashboard");
  };

  return (
    <div className="absolute inset-0 bg-[#071025] flex items-center justify-center p-4">
      {/* Framed mobile container - matches other screens */}
      <div
        className="w-full max-w-[420px] h-full max-h-[820px] rounded-[28px] overflow-hidden flex flex-col"
        style={{
          background: "linear-gradient(180deg, rgba(11,17,37,0.75), rgba(0,0,0,0.65))",
          border: "1px solid rgba(255,255,255,0.04)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.75)",
        }}
      >
        {/* decorative top radial (same visual language) */}
        <div
          className="absolute inset-x-0 -top-8 h-48 rounded-t-[22px] pointer-events-none"
          style={{
            background:
              "radial-gradient(800px 120px at 10% 0%, rgba(60,80,140,0.12), transparent 20%), linear-gradient(90deg, rgba(40,50,90,0.06), transparent 40%)",
            transform: "translateY(-6%)",
          }}
          aria-hidden
        />

        {/* Content area (scrollable) */}
        <div className="flex-1 overflow-auto">
          <div className="px-6 pt-6 pb-4 text-white min-h-[680px] flex flex-col">
            {/* header */}
            <div className="flex flex-col items-center text-center mb-4">
              <h1 className="text-2xl font-extrabold">How would you rate this training?</h1>
            </div>

            {/* Step content */}
            <div className="flex-1">
              {step === 1 ? (
                <motion.div key="step1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  {/* Question 1 */}
                  <div className="mb-8">
                    <div className="text-sm text-white/70 mb-3 text-center">How helpful was the information?</div>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRatingHelpfulness(n)}
                          aria-label={`${n} stars helpfulness`}
                          className="p-1"
                        >
                          <Star filled={ratingHelpfulness >= n} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question 2 */}
                  <div className="mb-12">
                    <div className="text-sm text-white/70 mb-3 text-center">How engaging was the presentation of the content?</div>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRatingEngagement(n)}
                          aria-label={`${n} stars engagement`}
                          className="p-1"
                        >
                          <Star filled={ratingEngagement >= n} />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="step2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="mb-6">
                    <div className="text-sm text-white/80 mb-3">What did you think of the length?</div>
                    <div className="flex flex-col gap-3">
                      {lengthOptions.map((opt) => {
                        const active = lengthChoice === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setLengthChoice(opt)}
                            className={`py-3 px-4 rounded-full text-left ${
                              active ? "bg-white text-black" : "bg-white/4 border border-white/6 text-white/90"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-sm text-white/80 mb-3">How many days a week?</div>
                    <div className="flex gap-2 flex-wrap">
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <DayPill key={n} n={n} selected={daysPerWeek === n} onSelect={setDaysPerWeek} />
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <textarea
                      value={freeText}
                      onChange={(e) => setFreeText(e.target.value)}
                      className="w-full min-h-[88px] rounded-lg bg-white/4 border border-white/6 p-3 text-white placeholder:text-white/40"
                      placeholder="Anything else you'd like to share"
                    />
                  </div>

                  <div className="mb-6">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-md bg-white/4 border border-white/6 px-3 py-2 text-white placeholder:text-white/40"
                      placeholder="Enter your name"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer actions inside scroll area so it flows naturally on small heights */}
            <div className="pt-2 pb-2">
              {step === 1 ? (
                <button
                  onClick={() => canGoToStep2 && setStep(2)}
                  className={`w-full py-4 rounded-full ${canGoToStep2 ? "bg-white text-black" : "bg-white/6 text-white/40"}`}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleFinalSubmit}
                  className={`w-full py-4 rounded-full ${canSubmit ? "bg-white text-black" : "bg-white/6 text-white/40"}`}
                  disabled={!canSubmit}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom spacer + home indicator imitation */}
        <div className="px-6 pb-6 flex flex-col items-center gap-4">
          <div className="w-24 h-1.5 bg-white/70 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill={filled ? "white" : "none"}
      stroke={filled ? "white" : "rgba(255,255,255,0.4)"}
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.93 5.782 1.4 8.164L12 18.897 4.662 23.156l1.4-8.164L.132 9.21l8.2-1.192L12 .587z" />
    </svg>
  );
}

function DayPill({ n, selected, onSelect }: { n: number; selected: boolean; onSelect: (n: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(n)}
      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium ${
        selected ? "bg-white text-black" : "bg-white/6 text-white/70"
      }`}
    >
      {n}
    </button>
  );
}
