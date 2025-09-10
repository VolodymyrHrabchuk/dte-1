"use client";

import Image from "next/image";
import { useState, useMemo, useRef, useEffect } from "react";
import Flashcards, { FlashcardsContent } from "@/components/Flashcards";
import PrefetchTranscripts from "@/components/PrefetchTranscripts";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";

export default function LandingPage() {
  const [showFlashcards, setShowFlashcards] = useState(false);
  const router = useRouter();
  const mountTimeRef = useRef<number>(0);
  const flashcardsKeyRef = useRef(0);

  const visualRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [currentBgImage, setCurrentBgImage] = useState<string>("");
  const [videoEndedMap, setVideoEndedMap] = useState<Record<string, boolean>>(
    {}
  );

  const flashcards = useMemo<FlashcardsContent[]>(
    () => [
      {
        id: "f1",
        type: "video",
        videoUrl: "/video-1.mp4",
        backgroundImage: "/video-1.mp4",
        groupId: "step1",
      },
      {
        id: "f2",
        type: "video",
        videoUrl: "/video-2.mp4",
        backgroundImage: "/video-2.mp4",
        groupId: "step2",
        showTimerAfterVideo: true,
        timerDuration: 60,
        title: "Breath Focus Exercise",
        content:
          "Bring to mind one moment in the past week where you stayed engaged despite doubt. Sit with that memory and let it ground you in your ability to stay present.",
      },
      {
        id: "f3",
        type: "video",
        videoUrl: "/video-3.mp4",
        backgroundImage: "/video-3.mp4",
        groupId: "step3",
        showInputAfterVideo: true,
        title: "What's Your Commitment?",
        content:
          "What is one small commitment you can carry forward from the moment you reflected on during the timer?",
      },
    ],
    []
  );

  useEffect(() => {
    setCurrentBgImage(flashcards[0]?.backgroundImage || "/video-bg.png");
    videoRefs.current = {};
  }, [flashcards]);

  const audioUrls = useMemo(() => {
    return flashcards
      .filter((c): c is FlashcardsContent & { audioUrl: string } => {
        const maybe = c as unknown as Record<string, unknown>;
        return typeof maybe.audioUrl === "string";
      })
      .map((c) => c.audioUrl);
  }, [flashcards]);

  const isVideoSrc = (src?: string) => /\.mp4$|\.webm$|\.ogg$/i.test(src ?? "");

  const handleStart = () => {
    flashcardsKeyRef.current += 1;
    mountTimeRef.current = Date.now();
    setShowFlashcards(true);
    setCurrentBgImage(flashcards[0]?.backgroundImage || "/video-bg.png");
    setVideoEndedMap({});
  };

  const handleSlideChange = (index: number) => {
    if (mountTimeRef.current && Date.now() - mountTimeRef.current < 350) return;
    const card = flashcards[index];
    if (!card) return;

    const videoHasEnded = !!videoEndedMap[card.id];
    if (card.id === "f3" && videoHasEnded) {
      setCurrentBgImage("/Train.jpg");
    } else {
      const newBg = card.backgroundImage || "/video-bg.png";
      setCurrentBgImage(newBg);
    }
  };

  const handleVideoEnded = (cardId: string) => {
    setVideoEndedMap((prev) => ({ ...prev, [cardId]: true }));
    if (cardId === "f3") {
      setCurrentBgImage("/Train.jpg");
    }
  };

  const handleComplete = () => {
    setShowFlashcards(false);
    try {
      const prev = JSON.parse(localStorage.getItem("planProgress") || "{}");
      const merged = { ...prev, discover: "completed", train: "completed" };
      localStorage.setItem("planProgress", JSON.stringify(merged));
    } catch {
      localStorage.setItem(
        "planProgress",
        JSON.stringify({
          discover: "completed",
          train: "completed",
          execute: "available",
        })
      );
    }
    router.push("/dashboard");
  };

  return (
    <div className='absolute inset-0 flex items-center justify-center '>
      <PrefetchTranscripts urls={audioUrls} />

      <div
        className='w-[520px] rounded-[28px] p-6 flex flex-col items-center text-left relative overflow-hidden'
        style={{
          background:
            "linear-gradient(180deg, rgba(3,8,20,0.96) 0%, rgba(6,7,12,0.94) 60%, rgba(3,6,20,0.85) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.02), 0 12px 40px rgba(0,0,0,0.6)",
        }}
      >
        <div
          className='absolute inset-x-0 -top-8 h-48 rounded-t-[22px] pointer-events-none'
          style={{
            background:
              "radial-gradient(800px 120px at 10% 0%, rgba(60,80,140,0.12), transparent 20%), linear-gradient(90deg, rgba(40,50,90,0.06), transparent 40%)",
            transform: "translateY(-6%)",
          }}
          aria-hidden
        />

        <div className='w-full flex-0 mb-4'>
          <div
            ref={visualRef}
            className='relative w-full rounded-[14px] overflow-hidden'
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {!showFlashcards && (
              <div className='w-full h-[320px] relative'>
                <Image
                  src='/Train.jpg'
                  alt='Train'
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
            )}

            {showFlashcards && (
              <div
                className='min-h-screen max-w-md relative overflow-hidden'
                style={{ minHeight: 0 }}
              >
                <div className='absolute inset-0'>
                  {[
                    ...flashcards,
                    { id: "static-bg", backgroundImage: "/Train.jpg" },
                  ].map((card) => {
                    const src = card.backgroundImage;
                    if (!src) return null;

                    const isVideo = isVideoSrc(src);
                    const active = src === currentBgImage;
                    const videoHasEnded = !!videoEndedMap[card.id];

                    const shouldBlur = card.id === "f2" && videoHasEnded;

                    return (
                      <div
                        key={card.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                          active ? "opacity-100" : "opacity-0"
                        }`}
                        aria-hidden
                      >
                        {isVideo ? (
                          <>
                            <video
                              ref={(el) => {
                                if (card.id) videoRefs.current[card.id] = el;
                              }}
                              className={twMerge(
                                "absolute inset-0 w-full h-full object-cover transition-all duration-500",
                                shouldBlur
                                  ? "filter blur-[10px]"
                                  : "filter-none"
                              )}
                              src={src}
                              autoPlay
                              muted
                              loop
                              playsInline
                            />
                            <div className='absolute inset-0 bg-black/30' />
                          </>
                        ) : (
                          <div
                            className='absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-[10px]'
                            style={{ backgroundImage: `url("${src}")` }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className='z-10'>
                  <div
                    className='h-screen flex flex-col'
                    style={{ minHeight: 320 }}
                  >
                    <Flashcards
                      key={flashcardsKeyRef.current}
                      cards={flashcards}
                      onComplete={handleComplete}
                      onSlideChange={handleSlideChange}
                      onVideoEnded={handleVideoEnded}
                      className='flex-1'
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {!showFlashcards && (
          <div className='w-full flex-1 pt-4'>
            <h1 className='text-[28px] font-extrabold text-white leading-snug mb-3'>
              Getting Past The Self Doubt Spiral
            </h1>

            <p className='text-[15px] text-white/70 leading-relaxed mb-6'>
              Confidence can take a hit after a mistake or poor performance.
              That drop you experience is normal. What matters is how you
              respond.
            </p>

            <div className='flex items-center gap-3 text-white/75 mb-8'>
              <div className='w-8 h-8 rounded-md flex items-center justify-center bg-white/6'>
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  aria-hidden
                >
                  <path
                    d='M12 2v6'
                    stroke='white'
                    strokeWidth='1.2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <circle
                    cx='12'
                    cy='14'
                    r='6'
                    stroke='white'
                    strokeWidth='1.2'
                  />
                </svg>
              </div>
              <div className='text-sm text-white/80'>3 Flashcards</div>
            </div>

            <div className='mt-auto w-full'>
              <button
                onClick={handleStart}
                className='w-full py-4 rounded-full bg-white text-black font-medium text-lg shadow-[0_8px_24px_rgba(0,0,0,0.6)]'
                style={{
                  boxShadow:
                    "0 12px 30px rgba(11,14,24,0.7), inset 0 -6px 18px rgba(0,0,0,0.25)",
                }}
              >
                Start
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
