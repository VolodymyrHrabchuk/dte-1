"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Arrow from "@/public/arrow.svg";
import { useRouter } from "next/navigation";
import PopperCrackerIcon from "@/components/icons/PopperCrackerIcon";
import HiteScoreCard from "@/components/ui/HiteScoreCard";

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

  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState<number>(0);

  // ---------- success sound  ----------
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const a = new Audio("/success.mp3");
    a.preload = "auto";
    a.volume = 0.8;
    // @ts-expect-error playsInline 
    a.playsInline = true;
    successAudioRef.current = a;
    return () => {
      if (successAudioRef.current) {
        successAudioRef.current.pause();
        successAudioRef.current.src = "";
        successAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!showResults) return;
    const t = setTimeout(() => {
      const a = successAudioRef.current;
      if (!a) return;
      try {
        a.currentTime = 0;
        a.play().catch(() => {});
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [showResults]);

  const commonAnswerText = [
    "Strongly disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly agree",
  ];
  const commonAnswerMap = [
    "strong_disagree",
    "disagree",
    "neutral",
    "agree",
    "strong_agree",
  ];

  const updateProgress = (index: number) => {
    const total = questions.length || 1;
    setFillPercentage(Math.floor(((index + 1) / total) * 100));
  };

  useEffect(() => {
    const sample: Question[] = [
      {
        id: 1,
        question:
          "I am the kind of athlete who gets results even when the odds are stacked against me.",
        position: 1,
        use_common_answer: true,
        score_type: "competitiveness",
        reverse_scoring: false,
        assessment: 1,
      },
      {
        id: 2,
        question: "I believe in my ability to be better than my peers.",
        position: 2,
        use_common_answer: true,
        score_type: "composure",
        reverse_scoring: false,
        assessment: 1,
      },
      {
        id: 3,
        question:
          "I consistently contribute to my team's success in a positive way.",
        position: 3,
        use_common_answer: true,
        score_type: "confidence",
        reverse_scoring: false,
        assessment: 1,
      },
      {
        id: 4,
        question: "I get visibly frustrated when things don't go my way.",
        position: 4,
        use_common_answer: true,
        score_type: "confidence",
        reverse_scoring: false,
        assessment: 1,
      },
      {
        id: 5,
        question: "I have been told I am a clutch performer.",
        position: 5,
        use_common_answer: true,
        score_type: "confidence",
        reverse_scoring: false,
        assessment: 1,
      },
      {
        id: 6,
        question: "I have the skills to be a great athlete.",
        position: 6,
        use_common_answer: true,
        score_type: "confidence",
        reverse_scoring: false,
        assessment: 1,
      },
      {
        id: 7,
        question:
          "I often worry that I don't have what it takes to be as good as I want to be.",
        position: 7,
        use_common_answer: true,
        score_type: "confidence",
        reverse_scoring: false,
        assessment: 1,
      },
      {
        id: 8,
        question: "I strive to be more successful than those around me.",
        position: 8,
        use_common_answer: true,
        score_type: "confidence",
        reverse_scoring: false,
        assessment: 1,
      },
      {
        id: 9,
        question: "Sometimes I let other people win if it lessens conflict.",
        position: 9,
        use_common_answer: true,
        score_type: "confidence",
        reverse_scoring: false,
        assessment: 1,
      },
      {
        id: 10,
        question: "The desire to compete comes from deep within me.",
        position: 10,
        use_common_answer: true,
        score_type: "confidence",
        reverse_scoring: false,
        assessment: 1,
      },
      {
        id: 11,
        question:
          "When the game is on the line, my teammates trust me to handle the pressure.",
        position: 11,
        use_common_answer: true,
        score_type: "confidence",
        reverse_scoring: false,
        assessment: 1,
      },
      {
        id: 12,
        question: "Winning is a core motivator for me.",
        position: 12,
        use_common_answer: true,
        score_type: "confidence",
        reverse_scoring: false,
        assessment: 1,
      },
    ];
    const t = setTimeout(() => {
      setQuestions(sample);
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      setFillPercentage(Math.floor((1 / questions.length) * 100));
      setSelectedIndex(0);
      setTextVisible(true);
    }
  }, [questions]);

  useEffect(() => {
    if (questions.length === 0) return;
    setTextVisible(false);
    const t = setTimeout(() => {
      setTextVisible(true);
      updateProgress(selectedIndex);
    }, 50);
    return () => clearTimeout(t);
  }, [selectedIndex, questions.length]);

  const computeAndShowResults = (scoresObj: Record<string, number>) => {
    const totalPoints = Object.values(scoresObj).reduce((a, b) => a + b, 0);
    const maxPoints = questions.length * 2 || 1;
    const scaled = Math.round((totalPoints / maxPoints) * 1000);
    setFinalScore(scaled);
    setShowResults(true);
  };

  const handleAnswer = (choiceIndex: number) => {
    const current = questions[selectedIndex];
    if (!current) return;

    let pts = choiceIndex === 2 ? 1 : choiceIndex >= 3 ? 2 : 0;
    if (current.reverse_scoring) pts = 2 - pts;

    setScores((s) => ({
      ...s,
      [current.score_type]: (s[current.score_type] || 0) + pts,
    }));

    try {
      const stored = JSON.parse(localStorage.getItem("answers") || "[]");
      stored.push({
        questionId: current.id,
        score: pts,
        score_type: current.score_type,
        commonAnswer: current.use_common_answer
          ? commonAnswerMap[choiceIndex]
          : null,
      });
      localStorage.setItem("answers", JSON.stringify(stored));
    } catch {}

    const next = selectedIndex + 1;
    if (next >= questions.length) {
      try {
        const stored = JSON.parse(localStorage.getItem("answers") || "[]");
        const aggregate: Record<string, number> = {};
        for (const a of stored) {
          aggregate[a.score_type] =
            (aggregate[a.score_type] || 0) + Number(a.score || 0);
        }
        aggregate.composure ??= 0;
        aggregate.confidence ??= 0;
        aggregate.competitiveness ??= 0;
        aggregate.commitment ??= 0;
        computeAndShowResults(aggregate);
      } catch {
        computeAndShowResults(scores);
      }
    } else {
      setSelectedIndex(next);
    }
  };

  const handleBack = () => {
    if (showResults) {
      setShowResults(false);
      setSelectedIndex(Math.max(0, questions.length - 1));
      return;
    }
    if (selectedIndex > 0) {
      try {
        const stored = JSON.parse(localStorage.getItem("answers") || "[]");
        const last = stored.pop();
        localStorage.setItem("answers", JSON.stringify(stored));
        if (last) {
          setScores((s) => {
            const copy = { ...s };
            const t = last.score_type as string;
            copy[t] = Math.max(0, (copy[t] || 0) - Number(last.score || 0));
            return copy;
          });
        }
      } catch {}
      setSelectedIndex((i) => Math.max(0, i - 1));
    } else {
      router.back();
    }
  };

  const onResultsNext = () => {
    router.push("/dashboard");
  };

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

  if (showResults) {
    return (
      <div className='absolute inset-0 flex flex-col items-center justify-center  text-white'>
        <div className='w-full max-w-[520px] sm:max-w-[560px] flex-1 flex items-center justify-center'>
          <div
            className='w-full h-full max-h-[100vh]  p-6 text-center flex flex-col justify-between'
            style={{
              background:
                "linear-gradient(180deg, rgba(11,17,37,0.75), rgba(0,0,0,0.65))",
              border: "1px solid rgba(255,255,255,0.04)",
              boxShadow: "0 30px 60px rgba(0,0,0,0.75)",
            }}
          >
            <div className='flex-1 flex flex-col items-center justify-center'>
              <div className='mb-6 flex justify-center'>
                <PopperCrackerIcon />
              </div>

              <h1 className='text-3xl font-extrabold leading-tight text-center'>
                You Did It!
              </h1>
              <p className='mt-2 text-sm text-white/80 text-center mb-10'>
                You&apos;ve completed HITE Assessment!
              </p>

              {/* показываем финальный скор ТОЛЬКО на этом экране, без записи в localStorage */}
              <HiteScoreCard score={952} />
            </div>

            <div className='mt-6 mb-4'>
              <button onClick={onResultsNext} className='text-white text-lg'>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // QUESTION SCREEN
  const current = questions[selectedIndex];

  return (
    <div className='absolute inset-0 flex items-center justify-center '>
      <div className='w-full max-w-[520px] sm:max-w-[560px] h-full flex items-center justify-center py-6'>
        <div className='w-full h-full max-h-[90svh] rounded-[28px] p-6 flex flex-col bg-transparent text-white'>
          {/* header */}
          <div className='flex items-center gap-4'>
            <button
              className='p-1 rounded-full bg-transparent hover:bg-white/6 transition'
              onClick={handleBack}
              aria-label='Back'
            >
              <Image src={Arrow} alt='Arrow' width={28} height={28} />
            </button>
            <h2 className='text-white font-bold text-[20px]'>
              HITE Assessment
            </h2>
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

          {/* question */}
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

          {/* answers */}
          <div className='mt-6 flex flex-col items-center gap-4 flex-none  overflow-y-auto py-2'>
            {current.use_common_answer ? (
              commonAnswerText.map((txt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className='w-full h-[46px] rounded-[999px] relative flex items-center justify-center transition-transform duration-120 ease-in-out active:scale-[0.99] focus:outline-none'
                >
                  <div
                    className='absolute inset-0 rounded-[999px]'
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.03), 0 6px 30px rgba(0,0,0,0.6)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  />
                  <div className='relative z-10 text-white text-[18px] font-medium select-none py-2'>
                    {txt}
                  </div>
                </button>
              ))
            ) : (
              <div className='text-white/70 text-center'>
                <p>
                  This question requires a text answer. UI not implemented for
                  text input.
                </p>
              </div>
            )}
          </div>

          <div className='mt-auto pt-2' />
        </div>
      </div>
    </div>
  );
}
