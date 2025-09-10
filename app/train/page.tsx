"use client";

import Image from "next/image";
import { useState, useMemo, useRef, useEffect } from "react";
import Flashcards, { FlashcardsContent } from "@/components/Flashcards";
import PrefetchTranscripts from "@/components/PrefetchTranscripts";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";

type BgLayer = { id: string; backgroundImage?: string };

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

  // типизированные слои фона
  const bgLayers: BgLayer[] = useMemo(
    () => [
      ...flashcards.map(({ id, backgroundImage }) => ({ id, backgroundImage })),
      { id: "static-bg", backgroundImage: "/Train.jpg" },
    ],
    [flashcards]
  );

  return (
    <div className='absolute inset-0 flex items-center justify-center'>
      <PrefetchTranscripts urls={audioUrls} />

      {/* === Card === */}
      <div
        className='
          w-full max-w-[440px]
          rounded-[28px] relative overflow-hidden
          border border-white/20
          shadow-[0_40px_120px_rgba(0,0,0,0.6)]
        '
      >
        {/* фон-текстура */}
        <Image src='/bg.png' alt='bg' fill className='absolute z-[-1]' />

        {/* ⬇️ паддинги только на лендинге */}
        <div
          className={twMerge(
            "flex flex-col",
            showFlashcards ? "p-0 gap-0" : "p-4 sm:p-5 gap-4"
          )}
        >
          {/* Visual / Poster */}
          <div className='w-full'>
            <div
              ref={visualRef}
              className='relative w-full rounded-[14px] overflow-hidden ring-1 ring-white/10'
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
                // ✅ фикс: явная высота для зоны карточек, поверх — контент со z-index
                <div className='relative overflow-hidden h-screen rounded-none'>
                  <div className='absolute inset-0'>
                    {bgLayers.map((layer) => {
                      const src = layer.backgroundImage;
                      if (!src) return null;

                      const isVideo = isVideoSrc(src);
                      const active = src === currentBgImage;
                      const videoHasEnded = !!videoEndedMap[layer.id];
                      const shouldBlur = layer.id === "f2" && videoHasEnded;

                      return (
                        <div
                          key={layer.id}
                          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            active ? "opacity-100" : "opacity-0"
                          }`}
                          aria-hidden
                        >
                          {isVideo ? (
                            <>
                              <video
                                ref={(el) => {
                                  if (layer.id)
                                    videoRefs.current[layer.id] = el;
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

                  {/* контент флеш-карт поверх фона */}
                  <div className='relative z-10 h-full'>
                    <Flashcards
                      key={flashcardsKeyRef.current}
                      cards={flashcards}
                      onComplete={handleComplete}
                      onSlideChange={handleSlideChange}
                      onVideoEnded={handleVideoEnded}
                      className='h-full w-full'
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content (только на лендинге) */}
          {!showFlashcards && (
            <div className='w-full flex-1'>
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
                    width='19'
                    height='24'
                    viewBox='0 0 19 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M11.4872 10.1053V0L0 13.8947H7.1795V24L18.6667 10.1053H11.4872Z'
                      fill='url(#paint0_linear_2547_10725)'
                      fillOpacity='0.5'
                    />
                    <defs>
                      <linearGradient
                        id='paint0_linear_2547_10725'
                        x1='9.33333'
                        y1='0'
                        x2='9.33333'
                        y2='24'
                        gradientUnits='userSpaceOnUse'
                      >
                        <stop stopColor='white' />
                        <stop offset='1' stopColor='white' stopOpacity='0.2' />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className='text-sm text-white/80'>3 Flashcards</div>
              </div>

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
          )}
        </div>
      </div>
    </div>
  );
}
