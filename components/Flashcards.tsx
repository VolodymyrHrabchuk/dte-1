"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import type Swiper from "swiper";
import { Mousewheel } from "swiper/modules";
import { twMerge } from "tailwind-merge";
import FlashcardSlide from "./FlashCardSlide";
import "swiper/css";

export type FlashcardsContent = {
  id: string;
  type: "video" | "timer" | "text" | "input";
  title?: string;
  content?: string;
  videoUrl?: string;
  audioUrl?: string;
  backgroundImage?: string;
  groupId?: string;
  showTimerAfterVideo?: boolean;
  showInputAfterVideo?: boolean;
  timerDuration?: number;
};

type FlashcardsProps = {
  cards: FlashcardsContent[];
  onComplete?: () => void;
  onSlideChange?: (index: number) => void;
  onVideoEnded?: (cardId: string) => void;
  className?: string;
};

/** строим соответствие: индекс слайда -> логический индекс шага */
function buildLogicalMap(cards: FlashcardsContent[]) {
  const steps: { key: string; indices: number[] }[] = [];
  for (let i = 0; i < cards.length; i++) {
    const k = cards[i].groupId ?? cards[i].id;
    const last = steps[steps.length - 1];
    if (last && last.key === k) last.indices.push(i);
    else steps.push({ key: k, indices: [i] });
  }
  const logicalIndexBySlide = new Array<number>(cards.length);
  steps.forEach((s, idx) => s.indices.forEach(i => (logicalIndexBySlide[i] = idx)));
  return { logicalIndexBySlide, totalSteps: steps.length };
}

export default function Flashcards({
  cards,
  onComplete,
  onSlideChange,
  onVideoEnded,
  className,
}: FlashcardsProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [swiperInstance, setSwiperInstance] = useState<Swiper | null>(null);

  // ===== swipe SFX =====
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);
  const skipFirstSlideChangeRef = useRef(true);

  useEffect(() => {
    const a = new Audio("/swipe.mp3");
    a.preload = "auto";
    a.volume = 0.45;
    sfxRef.current = a;
    return () => {
      try {
        sfxRef.current?.pause();
      } catch {}
      sfxRef.current = null;
    };
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const unlockOnce = async () => {
      if (audioUnlockedRef.current) return;
      try {
        const a = sfxRef.current;
        if (!a) return;
        a.muted = true;
        await a.play();
        a.pause();
        a.currentTime = 0;
        a.muted = false;
        audioUnlockedRef.current = true;
      } catch {}
    };

    const onPointerDown = () => unlockOnce();
    const onWheel = () => unlockOnce();
    const onKeyDown = () => unlockOnce();

    root.addEventListener("pointerdown", onPointerDown, { passive: true });
    root.addEventListener("wheel", onWheel, { passive: true });
    root.addEventListener("keydown", onKeyDown);
    return () => {
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const playSwipeSfx = () => {
    const a = sfxRef.current;
    if (!a) return;
    try {
      a.currentTime = 0;
      void a.play().catch(() => {});
    } catch {}
  };

  const { logicalIndexBySlide, totalSteps } = useMemo(
    () => buildLogicalMap(cards),
    [cards]
  );

  const handleSlideChange = (swiper: Swiper) => {
    setCurrentCardIndex(swiper.activeIndex);
    onSlideChange?.(swiper.activeIndex);
    if (skipFirstSlideChangeRef.current) {
      skipFirstSlideChangeRef.current = false;
      return;
    }
    playSwipeSfx();
  };

  const handleComplete = () => onComplete?.();

  if (!cards.length) return null;

  return (
    <section
      ref={containerRef}
      className={twMerge("h-full outline-none", className)}
      tabIndex={0}
    >
      <SwiperComponent
        direction="vertical"
        spaceBetween={0}
        slidesPerView={1}
        modules={[Mousewheel]}
        mousewheel={true}
        onSwiper={setSwiperInstance}
        onSlideChange={handleSlideChange}
        className="h-full"
      >
        {cards.map((card, idx) => (
          <SwiperSlide key={card.id}>
            <FlashcardSlide
              card={card}
              isActive={idx === currentCardIndex}
              index={idx}
              cardsLength={cards.length}
              userInput={userInput}
              onUserInputChange={setUserInput}
              swiper={swiperInstance}
              onComplete={handleComplete}
              progressIndex={logicalIndexBySlide[idx]}
              progressLength={totalSteps}
              onVideoEnded={onVideoEnded}
            />
          </SwiperSlide>
        ))}
      </SwiperComponent>
    </section>
  );
}