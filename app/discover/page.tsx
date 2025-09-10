"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Arrow from "@/public/arrow.svg";
import { useRouter } from "next/navigation";

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
  answers?: string[];
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
  const [picked, setPicked] = useState<Record<number, number>>({}); // qId -> answerIndex

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateProgress = (index: number) => {
    const total = questions.length || 1;
    setFillPercentage(Math.floor(((index + 1) / total) * 100));
  };

  useEffect(() => {
    const sample: Question[] = [
      {
        id: 1,
        question: "What do you want to focus on today?",
        position: 1,
        use_common_answer: true,
        score_type: "confidence",
        reverse_scoring: false,
        assessment: 1,
        answers: ["Self Confidence", "Inner Strength", "Mental Toughness"],
      },
      {
        id: 2,
        question:
          "How are you feeling about your Self Confidence today? (for the purpose of this demo, select something 3 or below)",
        position: 2,
        use_common_answer: true,
        score_type: "composure",
        reverse_scoring: false,
        assessment: 1,
        answers: [
          "My self-belief is on fire today.",
          "I’m feeling more confident in myself lately.",
          "Some belief is there, but it’s not steady.",
          "I’ve been second-guessing myself a lot.",
          "I’m barely trusting my abilities right now.",
        ],
      },
      {
        id: 3,
        question:
          "What’s getting in the way of stronger Self Belief today? (for the purpose of this demo, select unmotivated)",
        position: 3,
        use_common_answer: true,
        score_type: "competitiveness",
        reverse_scoring: false,
        assessment: 1,
        answers: [
          "I just suffered a setback.",
          "I’m feeling off or unmotivated.",
          "I’m under a lot of pressure right now.",
          "I’m not where I want to be.",
          "I’m frustrated with people around me.",
        ],
      },
    ];
    setTimeout(() => {
      setQuestions(sample);
      setLoading(false);
    }, 120);
  }, []);

  useEffect(() => {
    if (!questions.length) return;
    setSelectedIndex(0);
    setTextVisible(true);
    setFillPercentage(Math.floor((1 / questions.length) * 100));
  }, [questions]);

  useEffect(() => {
    if (!questions.length) return;
    setTextVisible(false);
    const t = setTimeout(() => {
      setTextVisible(true);
      updateProgress(selectedIndex);
    }, 60);
    return () => clearTimeout(t);
  }, [selectedIndex, questions.length, updateProgress]);

  const handleAnswer = (answerIndex: number) => {
    const current = questions[selectedIndex];
    if (!current) return;

    setPicked((p) => ({ ...p, [current.id]: answerIndex }));

    const answers = current.answers ?? [];
    const pointsForChoice = Math.max(answers.length - 1 - answerIndex, 0); // 0..max

    setScores((prev) => ({
      ...prev,
      [current.score_type]: (prev[current.score_type] || 0) + pointsForChoice,
    }));

    try {
      const stored = JSON.parse(localStorage.getItem("answers") || "[]");
      stored.push({
        questionId: current.id,
        score: pointsForChoice,
        score_type: current.score_type,
        answer: answers[answerIndex] ?? null,
      });
      localStorage.setItem("answers", JSON.stringify(stored));
    } catch {}

    const next = selectedIndex + 1;
    if (next >= questions.length) {
      localStorage.setItem(
        "planProgress",
        JSON.stringify({ discover: "completed", train: "available" })
      );
      router.push("/dashboard?view=discover");
    } else {
      // небольшая задержка, чтобы увидеть «зажжённый» фон
      setTimeout(() => setSelectedIndex(next), 120);
    }
  };

  const handleBack = () => {
    if (selectedIndex > 0) {
      try {
        const stored = JSON.parse(localStorage.getItem("answers") || "[]");
        const last = stored.pop();
        localStorage.setItem("answers", JSON.stringify(stored));
        if (last) {
          setScores((s) => {
            const t = last.score_type as string;
            return {
              ...s,
              [t]: Math.max(0, (s[t] || 0) - Number(last.score || 0)),
            };
          });
        }
      } catch {}
      setSelectedIndex((i) => Math.max(0, i - 1));
    } else {
      router.back();
    }
  };

  if (loading)
    return (
      <div className='absolute inset-0 flex items-center justify-center text-white text-2xl'>
        Loading assessment...
      </div>
    );
  if (error)
    return (
      <div className='absolute inset-0 flex flex-col items-center justify-center text-red-500 text-center px-4'>
        <p className='text-xl'>Error: {error}</p>
        <p className='text-sm mt-2'>Please try refreshing the page.</p>
      </div>
    );
  if (!questions.length)
    return (
      <div className='absolute inset-0 flex items-center justify-center text-white text-2xl'>
        No HITE Assessment Questions Found
      </div>
    );

  const current = questions[selectedIndex];
  const isScaleQ2 =
    (current.position === 2 || current.id === 2) &&
    current.answers?.length === 5;

  return (
    <div className='absolute inset-0 flex items-center justify-center'>
      <div
        className='w-full h-screen rounded-[28px] overflow-hidden flex flex-col'
        
      >
        <div className='flex-1 overflow-auto'>
          <div className='px-6 py-6'>
            {/* header */}
            <div className='flex items-center gap-4'>
              <button
                className='p-1 rounded-full bg-transparent hover:bg-white/6 transition'
                onClick={handleBack}
                aria-label='Back'
              >
                <Image src={Arrow} alt='Arrow' width={28} height={28} />
              </button>
              <h2 className='text-white font-bold text-[20px]'>Discover</h2>
            </div>

            {/* progress */}
            <div className='mt-4'>
              <div className='w-full h-2 rounded-full bg-white/10 overflow-hidden'>
                <div
                  className='h-full bg-white rounded-full transition-all duration-500 ease-in-out shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>
            </div>

            {/* question */}
            <div className='mt-6'>
              <div
                className={`min-h-[72px] transition-opacity duration-300 ease-in-out ${
                  textVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                <p className='text-[20px] text-white leading-snug'>
                  {current.question}
                </p>
              </div>
            </div>

            {/* answers */}
            <div className='mt-4 flex flex-col gap-3'>
              {(current.answers ?? []).map((txt, i) => {
                const isPicked = picked[current.id] === i;

                // общее оформление «пилюли»
                const baseStyle: React.CSSProperties = {
                  background: isPicked
                    ? "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))"
                    : "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.00))",
                  border: isPicked
                    ? "1px solid rgba(255,255,255,0.22)"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isPicked
                    ? "inset 0 1px 0 rgba(255,255,255,0.12), 0 6px 30px rgba(0,0,0,0.6)"
                    : "inset 0 1px 0 rgba(255,255,255,0.06), 0 6px 30px rgba(0,0,0,0.6)",
                };

                if (isScaleQ2) {
                  const total = current.answers!.length;
                  const rank = total - i; // 5..1
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      className='w-full rounded-[999px] px-3 h-[68px] flex items-center gap-3 active:scale-[0.995] transition text-left'
                      style={baseStyle}
                    >
                      <span
                        className='flex-shrink-0 w-10 h-10 rounded-full grid place-items-center text-white/90 text-[15px] font-medium'
                        style={{
                          background: isPicked
                            ? "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))"
                            : "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                          border: "1px solid rgba(255,255,255,0.10)",
                        }}
                      >
                        {rank}
                      </span>

                      {/* одна строка, центр по вертикали */}
                      <div className='flex-1 flex items-center '>
                        <span className='text-white text-[16px] font-medium leading-snug'>
                          {txt}
                        </span>
                      </div>
                    </button>
                  );
                }

                // Q1 и Q3 — без номера
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className='w-full rounded-[999px] px-4 h-[68px] flex items-center  active:scale-[0.995] transition text-center'
                    style={baseStyle}
                  >
                    <div className='flex-1 flex items-center'>
                      <span className='text-white mx-auto text-[18px] font-medium leading-snug'>
                        {txt}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
