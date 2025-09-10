"use client";
import Counter from "./Counter";
import { FlashcardsContent } from "./Flashcards";
import AudioIcon from "./icons/AudioIcon";
import SwipeIcon from "./icons/SwipeIcon";
import BackButton from "./ui/BackButton";
import BookmarkButton from "./ui/BookmarkButton";
import TextArea from "./ui/TextArea";
import Timer from "./Timer";
import Swiper from "swiper";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Button from "./ui/Button";
import { createPortal } from "react-dom";
import PlayIcon from "./icons/PlayIcon";

type FlashcardSlideProps = {
  card: FlashcardsContent;
  isActive: boolean;
  index: number;
  cardsLength: number;
  userInput: string;
  onUserInputChange: (value: string) => void;
  swiper: Swiper | null;
  onComplete?: () => void;
  progressIndex?: number;
  progressLength?: number;
  onVideoEnded?: (cardId: string) => void;
};

export default function FlashcardSlide({
  card,
  isActive,
  index,
  cardsLength,
  userInput,
  onUserInputChange,
  swiper,
  onComplete,
  progressIndex,
  progressLength,
  onVideoEnded,
}: FlashcardSlideProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const frozeNearEnd = useRef(false);
  const isFirstVideoCard = card.type === "video" && index === 0;

  const hasTyped = useMemo(
    () =>
      (card.type === "input" ||
        (card.type === "video" && card.showInputAfterVideo && videoEnded)) &&
      userInput.trim().length > 0,
    [card.type, card.showInputAfterVideo, videoEnded, userInput]
  );

  const isLastSlide = index === cardsLength - 1;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (isActive) {
        setVideoEnded(false);
        setIsPaused(false);
        frozeNearEnd.current = false;

        try {
          video.currentTime = 0;
        } catch {}
        video
          .play()
          .then(() => setIsPaused(false))
          .catch(() => setIsPaused(true));
      } else {
        video.pause();
        setIsPaused(true);
      }
    }
  }, [isActive]);

  const notifyEnded = useCallback(() => {
    setVideoEnded(true);
    onVideoEnded?.(card.id);
  }, [card.id, onVideoEnded]);

  const handleTimeUpdate = () => {
    if (!isFirstVideoCard) return;
    const v = videoRef.current;
    if (!v || !isActive || !v.duration) return;

    const remaining = v.duration - v.currentTime;
    if (!frozeNearEnd.current && remaining <= 0.12) {
      frozeNearEnd.current = true;
      // Сдвигаем к последнему кадру и ставим паузу —
      // событие 'ended' не наступит, кадр останется на экране.
      try {
        v.currentTime = Math.max(0, v.duration - 0.08);
      } catch {}
      v.pause();
      setIsPaused(true);

      notifyEnded();
    }
  };

  const handleVideoEnded = () => {
    if (isFirstVideoCard) {
      const v = videoRef.current;
      if (v && v.duration) {
        try {
          v.currentTime = Math.max(0, v.duration - 0.08);
        } catch {}
        v.pause();
        setIsPaused(true);
      }
    }
    notifyEnded();
  };

  const handleSubmit = () => {
    if (swiper && !isLastSlide) {
      swiper.slideTo(index + 1, 300);
    } else {
      onComplete?.();
    }
  };

  const handleTimerComplete = () => {
    if (swiper && !isLastSlide) {
      swiper.slideTo(index + 1, 300);
    } else {
      onComplete?.();
    }
  };

  const toggleVideoPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video
        .play()
        .then(() => setIsPaused(false))
        .catch(() => setIsPaused(true));
    } else {
      video.pause();
      setIsPaused(true);
    }
  };

  const counterCount = progressIndex ?? index;
  const counterLength = progressLength ?? cardsLength;

  const showPostVideoContent =
    card.type === "video" &&
    videoEnded &&
    (card.showTimerAfterVideo || card.showInputAfterVideo);

  return (
    <div className='h-full flex flex-col relative text-white'>
      {card.type === "video" && !showPostVideoContent && (
        <div
          className='w-full h-full absolute inset-0 z-0'
          onClick={toggleVideoPlay}
        >
          <video
            ref={videoRef}
            src={card.videoUrl}
            className='w-full h-full object-cover'
            playsInline
            preload='auto'
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            muted={!isActive}
          />
          {isPaused && (
            <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
              <PlayIcon />
            </div>
          )}
        </div>
      )}

      <div className='relative z-10 flex flex-col flex-1 h-full pt-16 p-4 pointer-events-none'>
        <div className='pointer-events-auto'>
          <BackButton
            onClick={() => {
              if (index > 0) swiper?.slidePrev();
            }}
            className='mb-6'
          />
        </div>

        <Counter count={counterCount} length={counterLength} />

        <div className='flex-1 flex flex-col items-center mt-14'>
          {card.type === "video" && showPostVideoContent && (
            <div className='w-full h-full flex flex-col justify-start pointer-events-auto'>
              {card.showTimerAfterVideo && (
                <div className='flex-col'>
                  <div className='flex flex-col space-y-4 mb-12'>
                    {card.title && (
                      <h1 className='text-2xl font-medium text-white leading-tight'>
                        {card.title}
                      </h1>
                    )}
                    {card.content && (
                      <p className='text-white'>{card.content}</p>
                    )}
                  </div>
                  <Timer
                    timer={card.timerDuration || 60}
                    onComplete={handleTimerComplete}
                    className='mx-auto'
                  />
                </div>
              )}
              {card.showInputAfterVideo && (
                <div className='flex flex-col w-full space-y-4'>
                  {card.title && (
                    <h1 className='text-2xl font-medium text-white leading-tight'>
                      {card.title}
                    </h1>
                  )}
                  {card.content && <p className='text-white'>{card.content}</p>}
                  <TextArea
                    value={userInput}
                    onChange={(e) => onUserInputChange(e.target.value)}
                    placeholder='Type your answer...'
                  />
                </div>
              )}
            </div>
          )}

          {card.type === "timer" && (
            <div className='w-full h-full pointer-events-auto'>
              <div className='flex flex-col space-y-4 mb-12'>
                {card.title && (
                  <h1 className='text-2xl font-medium text-white leading-tight'>
                    {card.title}
                  </h1>
                )}
                {card.content && <p className='text-white'>{card.content}</p>}
              </div>
              <div className='flex flex-col items-center justify-center'>
                <Timer
                  timer={card.timerDuration || 10}
                  className='mx-auto'
                  onComplete={handleTimerComplete}
                />
              </div>
            </div>
          )}

          {card.type === "text" && (
            <div className='w-full h-full pointer-events-auto'>
              <div className='flex flex-col w-full space-y-4'>
                {card.title && (
                  <h1 className='text-2xl font-medium text-white leading-tight'>
                    {card.title}
                  </h1>
                )}
                {card.content && <p className='text-white'>{card.content}</p>}
                {card.audioUrl && (
                  <div className='flex justify-center -mx-4'>
                    <AudioIcon />
                  </div>
                )}
              </div>
            </div>
          )}

          {card.type === "input" && (
            <div className='flex flex-col w-full h-full space-y-4 pointer-events-auto'>
              {card.title && (
                <h1 className='text-2xl font-medium text-white leading-tight'>
                  {card.title}
                </h1>
              )}
              {card.content && <p className='text-white'>{card.content}</p>}
              <TextArea
                value={userInput}
                onChange={(e) => onUserInputChange(e.target.value)}
              />
            </div>
          )}
        </div>

        {index < cardsLength - 1 && card.type === "video" && !videoEnded && (
          <div className='absolute bottom-[2rem] left-0 right-0 flex justify-center z-20'>
            <SwipeIcon />
          </div>
        )}
      </div>

      {((card.type === "input" && hasTyped) ||
        (card.type === "video" &&
          card.showInputAfterVideo &&
          videoEnded &&
          hasTyped)) &&
      isActive &&
      mounted
        ? createPortal(
            <div className='fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+18px)] z-[1000]'>
              <div className='mx-auto w-full max-w-md px-4'>
                <Button
                  onClick={handleSubmit}
                  variant='button'
                  aria-label='Submit'
                  className='w-full'
                >
                  Submit
                </Button>
              </div>
            </div>,
            document.body
          )
        : null}

      <BookmarkButton
        className='fixed z-30 bottom-[2.375rem] right-4'
        active={bookmarked}
        onClick={() => setBookmarked((b) => !b)}
        aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
      />
    </div>
  );
}
