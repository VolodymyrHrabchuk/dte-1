"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Arrow from "@/public/arrow.svg";

import { useRouter } from "next/navigation";

// Интерфейс вопроса (extended with answers per-question)
interface Question {
  id: number;
  question: string;
  position: number;
  use_common_answer: boolean;
  score_type:
    | "composure"
    | "confidence"
    | "competitiveness"
    | "commitment"
    | string;
  reverse_scoring: boolean;
  assessment: number;
  answers?: string[]; // per-question answer texts
}

export default function Assessment() {
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const [fillPercentage, setFillPercentage] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    composure: 0,
    confidence: 0,
    competitiveness: 0,
    commitment: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New: final summary stored (kept for compatibility)
  const [finalScore, setFinalScore] = useState<number>(0);
  const [finalLevel, setFinalLevel] = useState<string>("");

  // for free-text answer (question 2)
  const [textAnswer, setTextAnswer] = useState("");

  // Helper to set progress width
  const updateProgress = (index: number) => {
    const total = questions.length || 1;
    setFillPercentage(Math.floor(((index + 1) / total) * 100));
  };

  // --- Demo questions with per-question answers provided by you ---
  useEffect(() => {
    const sample: Question[] = [
      {
        id: 1,
        question:
          "What’s one of the best ways to interrupt a self-doubt spiral?",
        position: 1,
        use_common_answer: true,
        score_type: "confidence",
        reverse_scoring: false,
        assessment: 1,
        answers: [
          "Push through until it fades.",
          "Make one small commitment you can follow through on.",
          "Wait for a good performance to feel better.",
        ],
      },
      {
        // second question: will render a textarea instead of predefined buttons
        id: 2,
        question:
          "Why do you think following through on small commitments helps interrupt doubt?",
        position: 2,
        use_common_answer: true,
        score_type: "composure",
        reverse_scoring: false,
        assessment: 1,
        answers: [
          // kept for compatibility but UI will show textarea for this question
          "My self-belief is on fire today.",
          "I’m feeling more confident in myself lately.",
          "Some belief is there, but it’s not steady.",
          "I’ve been second-guessing myself a lot.",
          "I’m barely trusting my abilities right now.",
        ],
      },
    ];

    // small delay to emulate fetch
    const t = setTimeout(() => {
      setQuestions(sample);
      setLoading(false);
    }, 120);
    return () => clearTimeout(t);
  }, []);

  // initial progress
  useEffect(() => {
    if (questions.length > 0) {
      setSelectedIndex(0);
      setTextVisible(true);
      setFillPercentage(Math.floor((1 / questions.length) * 100));
    }
  }, [questions]);

  // animate question text and update progress when index changes
  useEffect(() => {
    if (questions.length === 0) return;
    setTextVisible(false);
    const t = setTimeout(() => {
      setTextVisible(true);
      updateProgress(selectedIndex);
    }, 60);
    return () => clearTimeout(t);
  }, [selectedIndex, questions.length]);

  // compute final scaled score and persist
  const computeAndPersistResults = (aggregate: Record<string, number>) => {
    // compute total points and maxPoints from per-question answers length
    let totalPoints = 0;
    let maxPoints = 0;
    for (const q of questions) {
      const answersLen = q.answers?.length ?? 1;
      const qMax = Math.max(answersLen - 1, 0); // our per-question max = answers.length - 1
      maxPoints += qMax;
    }
    // aggregate sum
    totalPoints = Object.values(aggregate).reduce((a, b) => a + (b || 0), 0);

    // avoid division by zero
    const denom = maxPoints || 1;
    const scaled = Math.round((totalPoints / denom) * 1000);
    setFinalScore(scaled);

    let level = "Rookie";
    if (scaled >= 750) level = "Elite";
    else if (scaled >= 500) level = "Pro";
    else level = "Rookie";
    setFinalLevel(level);

    try {
      localStorage.setItem("hiteScores", JSON.stringify(aggregate));
      localStorage.setItem("answers", localStorage.getItem("answers") || "[]");
      localStorage.setItem("showDiscoverPopup", "true");
      localStorage.setItem("level", level);
      localStorage.setItem("finalScore", String(scaled));
    } catch {}

    return { scaled, level };
  };

  // when a user selects an answer (for button-based answers)
  const handleAnswer = (answerIndex: number) => {
    const current = questions[selectedIndex];
    if (!current) return;

    const answers = current.answers ?? [];
    // points are assigned as: highest points for first option, descending to 0
    const pointsForChoice = Math.max(answers.length - 1 - answerIndex, 0);

    // update running scores (score_type)
    setScores((prev) => {
      const copy = { ...prev };
      copy[current.score_type] =
        (copy[current.score_type] || 0) + pointsForChoice;
      return copy;
    });

    // append to localStorage answers for reliable aggregation
    try {
      const stored = JSON.parse(localStorage.getItem("answers") || "[]");
      stored.push({
        questionId: current.id,
        score: pointsForChoice,
        score_type: current.score_type,
        answer: answers[answerIndex] ?? null,
      });
      localStorage.setItem("answers", JSON.stringify(stored));
    } catch {
      // ignore storage issues
    }

    const next = selectedIndex + 1;
    if (next >= questions.length) {
      // aggregate from localStorage to be certain all answers counted
      try {
        const stored = JSON.parse(localStorage.getItem("answers") || "[]");
        const aggregate: Record<string, number> = {};
        for (const s of stored) {
          aggregate[s.score_type] =
            (aggregate[s.score_type] || 0) + Number(s.score || 0);
        }
        // ensure keys exist
        aggregate.composure = aggregate.composure || 0;
        aggregate.confidence = aggregate.confidence || 0;
        aggregate.competitiveness = aggregate.competitiveness || 0;
        aggregate.commitment = aggregate.commitment || 0;

        computeAndPersistResults(aggregate);
      } catch {
        // fallback to scores state
        computeAndPersistResults(scores);
      }

      localStorage.setItem(
        "planProgress",
        JSON.stringify({ discover: "completed", train: "available" })
      );
      router.push("/dashboard");
    } else {
      setSelectedIndex(next);
      // reset textAnswer when moving to next question (if any)
      setTextAnswer("");
    }
  };

  // Submit handler for free-text response (Q2)
  const handleTextSubmit = () => {
    const current = questions[selectedIndex];
    if (!current) return;

    // For free-text we do not assign points (or assign 0). If you want to map to points, modify here.
    const pointsForChoice = 0;

    // save typed answer
    try {
      const stored = JSON.parse(localStorage.getItem("answers") || "[]");
      stored.push({
        questionId: current.id,
        score: pointsForChoice,
        score_type: current.score_type,
        answer: textAnswer || null,
      });
      localStorage.setItem("answers", JSON.stringify(stored));
    } catch {
      // ignore
    }

    // update scores (no-op since pointsForChoice is 0, but kept for parity)
    setScores((prev) => {
      const copy = { ...prev };
      copy[current.score_type] =
        (copy[current.score_type] || 0) + pointsForChoice;
      return copy;
    });

    const next = selectedIndex + 1;
    if (next >= questions.length) {
      try {
        const stored = JSON.parse(localStorage.getItem("answers") || "[]");
        const aggregate: Record<string, number> = {};
        for (const s of stored) {
          aggregate[s.score_type] =
            (aggregate[s.score_type] || 0) + Number(s.score || 0);
        }
        aggregate.composure = aggregate.composure || 0;
        aggregate.confidence = aggregate.confidence || 0;
        aggregate.competitiveness = aggregate.competitiveness || 0;
        aggregate.commitment = aggregate.commitment || 0;

        computeAndPersistResults(aggregate);
      } catch {
        computeAndPersistResults(scores);
      }

      localStorage.setItem(
        "planProgress",
        JSON.stringify({
          discover: "completed",
          train: "completed",
          execute: "completed",
        })
      );
      router.push("/score");
    } else {
      setSelectedIndex(next);
      setTextAnswer("");
    }
  };

  // Back: remove last stored answer and return to previous question (if any)
  const handleBack = () => {
    if (selectedIndex > 0) {
      try {
        const stored = JSON.parse(localStorage.getItem("answers") || "[]");
        const last = stored.pop();
        localStorage.setItem("answers", JSON.stringify(stored));
        if (last) {
          setScores((s) => {
            const copy = { ...s };
            const t = last.score_type as string;
            const val = Number(last.score) || 0;
            copy[t] = Math.max(0, (copy[t] || 0) - val);
            return copy;
          });
        }
      } catch {
        // ignore
      }
      setSelectedIndex((i) => Math.max(0, i - 1));
    } else {
      // if on first question send user back to previous screen
      router.back();
    }
  };

  // UI states
  if (loading) {
    return (
      <div className='absolute inset-0 flex items-center justify-center text-white text-2xl'>
        Loading assessment...
      </div>
    );
  }
  if (error) {
    return (
      <div className='absolute inset-0 flex flex-col items-center justify-center text-red-500 text-center px-4'>
        <p className='text-xl'>Error: {error}</p>
        <p className='text-sm mt-2'>Please try refreshing the page.</p>
      </div>
    );
  }
  if (questions.length === 0) {
    return (
      <div className='absolute inset-0 flex items-center justify-center text-white text-2xl'>
        No HITE Assessment Questions Found
      </div>
    );
  }

  const current = questions[selectedIndex];

  return (
    <div className='absolute inset-0  flex items-center justify-center '>
      {/* Framed mobile container - matches success/other screens (width/height/background) */}
      <div className='w-full max-w-md h-screen  overflow-hidden flex flex-col'>
        {/* decorative top radial (same visual language) */}
        <div
          className='absolute inset-x-0 -top-8 h-48 rounded-t-[22px] pointer-events-none'
          style={{
            background:
              "radial-gradient(800px 120px at 10% 0%, rgba(60,80,140,0.12), transparent 20%), linear-gradient(90deg, rgba(40,50,90,0.06), transparent 40%)",
            transform: "translateY(-6%)",
          }}
          aria-hidden
        />

        {/* Scrollable content area */}
        <div className='flex-1 overflow-auto'>
          <div className='px-2 py-6'>
            {/* Header */}
            <div className='flex items-center gap-4'>
              <button
                className='p-1 rounded-full bg-transparent hover:bg-white/6 transition'
                onClick={handleBack}
                aria-label='Back'
              >
                <Image src={Arrow} alt='Arrow' width={28} height={28} />
              </button>
              <h2 className='text-white font-bold text-[20px]'>Execute</h2>
            </div>

            {/* progress */}
            <div className='mt-4'>
              <div className='w-full bg-white/10 h-2 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-white rounded-full transition-all duration-500 ease-in-out shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>
            </div>

            {/* fixed question area (scrolls if question too long) */}
            <div className='mt-6'>
              <div
                className={`h-28 overflow-y-auto transition-opacity duration-300 ease-in-out px-1 ${
                  textVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                <p className='text-[20px] text-white leading-snug'>
                  {current.question}
                </p>
              </div>
            </div>

            {/* answers area (fixed height so card doesn't jump) */}
            <div className='mt-6 flex flex-col items-center gap-4 flex-none h-[50%] overflow-y-auto py-2'>
              {/* If this is question with id === 2 render a textarea instead of buttons */}
              {current.id === 2 ? (
                <div className='w-full max-w-md h-[64%] flex flex-col'>
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder='Type your response here...'
                    className='w-full h-full min-h-[160px] max-h-[320px] rounded-lg p-4 resize-none bg-white/5 text-white placeholder:text-white/40 focus:outline-none border border-white/6'
                  />
                </div>
              ) : (
                (current.answers ?? []).map((txt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className='group relative w-full max-w-md h-[64px] rounded-[999px] flex items-center justify-start px-5 active:scale-[0.99] focus:outline-none'
                    aria-label={txt}
                  >
                    <div
                      className='absolute inset-0 rounded-[999px]'
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.00))",
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.03), 0 6px 30px rgba(0,0,0,0.6)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    />
                    <div
                      className='absolute inset-0 rounded-[999px] pointer-events-none'
                      style={{
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
                      }}
                    />

                    <span className='relative z-10 text-white text-base font-medium leading-snug text-left'>
                      {txt}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom area */}
        <div className='px-6 pb-6'>
          {current.id === 2 && textAnswer.trim().length > 0 && (
            <div className='mt-4'>
              <button
                onClick={handleTextSubmit}
                className='w-full max-w-[420px] mx-auto block rounded-3xl px-6 py-3 text-black text-lg font-medium bg-white'
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
