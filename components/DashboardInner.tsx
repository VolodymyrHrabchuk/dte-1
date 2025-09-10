// app/dashboard/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import HiteSummaryCard from "@/components/HiteSummaryCard";

type StepState = "locked" | "available" | "completed";

export default function DashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showDiscoverOnly = searchParams.get("view") === "discover";

  const DEFAULT_SCORE = 952;
  const DEFAULT_LEVEL = "Rookie";

  const [hiteScore] = useState(DEFAULT_SCORE);
  const [level] = useState(DEFAULT_LEVEL);
  const [activeStreak] = useState(5);

  const [discoverState, setDiscoverState] =
    useState<Exclude<StepState, "locked">>("available");
  const [trainState, setTrainState] = useState<StepState>("locked");
  const [executeState, setExecuteState] = useState<StepState>("locked");

  const prevDiscoverRef = useRef<string | null>(null);
  const prevTrainRef = useRef<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalFor, setModalFor] = useState<"train" | "execute" | null>(null);

  // Синк статусов
  const syncFromStorage = useCallback(() => {
    // В режиме после assessments показываем 3 шага, но кликабелен только Discover
    if (showDiscoverOnly) {
      setDiscoverState("available");
      setTrainState("locked");
      setExecuteState("locked");
      return;
    }

    try {
      const stored = JSON.parse(localStorage.getItem("planProgress") || "{}");

      const prevD = prevDiscoverRef.current;
      const prevT = prevTrainRef.current;

      const d = stored.discover === "completed" ? "completed" : "available";
      const t =
        stored.discover === "completed"
          ? stored.train === "completed"
            ? "completed"
            : "available"
          : "locked";
      const e =
        stored.execute === "completed"
          ? "completed"
          : stored.execute === "available"
          ? "available"
          : "locked";

      setDiscoverState(d as Exclude<StepState, "locked">);
      setTrainState(t as StepState);
      setExecuteState(e as StepState);

      // Доп. попапы при разблокировке в обычном режиме
      if (d === "completed" && t === "completed" && e === "completed") {
        prevDiscoverRef.current = d as StepState;
        prevTrainRef.current = t as StepState;
        return;
      }

      if (prevD !== "completed" && d === "completed") {
        setModalFor("train");
        setModalVisible(true);
      }
      if (prevT !== "completed" && t === "completed") {
        setModalFor("execute");
        setModalVisible(true);
      }

      prevDiscoverRef.current = d as StepState;
      prevTrainRef.current = t as StepState;
    } catch {
      setDiscoverState("available");
      setTrainState("locked");
      setExecuteState("locked");
    }
  }, [showDiscoverOnly]);

  // ПОКАЗАТЬ ПОПАП ТОЛЬКО ПРИ ПЕРЕХОДЕ С DISCOVER → DASHBOARD (?view=discover)
  useEffect(() => {
    if (!showDiscoverOnly) return; // работаем только на /dashboard?view=discover

    try {
      const p = JSON.parse(localStorage.getItem("planProgress") || "{}");
      const shouldShow =
        p?.discover === "completed" && p?.train === "available";
      const SEEN_KEY = "__train_popup_once";

      if (shouldShow && sessionStorage.getItem(SEEN_KEY) !== "1") {
        // маленькая задержка на маунт, чтобы исключить гонки с перерисовкой
        setTimeout(() => {
          setModalFor("train");
          setModalVisible(true);
          sessionStorage.setItem(SEEN_KEY, "1"); // показать ровно один раз для этого захода
        }, 60);
      }
    } catch {
      /* ignore */
    }
  }, [showDiscoverOnly]);

  // Общий ресинк по событиям
  useEffect(() => {
    syncFromStorage();

    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "planProgress") syncFromStorage();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") syncFromStorage();
    };

    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [syncFromStorage]);

  const onStartDiscover = () => router.push("/discover");
  const onStartTrain = () => {
    if (trainState !== "available") return;
    router.push("/train");
  };
  const onStartExecute = () => {
    if (executeState !== "available") return;
    router.push("/execute");
  };

  const onModalAction = () => {
    setModalVisible(false);
    if (modalFor === "train") router.push("/train");
    if (modalFor === "execute") router.push("/execute");
    setModalFor(null);
  };

  return (
    <div className='absolute inset-0 flex items-center justify-center'>
      {/* Мобильный фрейм */}
      <div
        className='
          w-full max-w-[520px] sm:max-w-[560px]
          h-full
          rounded-[28px] overflow-hidden flex flex-col
          py-6
        '
        style={{
          background:
            "linear-gradient(180deg, rgba(11,17,37,0.75), rgba(0,0,0,0.65))",
          border: "1px solid rgba(255,255,255,0.04)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.75)",
        }}
      >
        <div className='flex-1 overflow-auto'>
          <div className='px-2 text-white'>
            <header className='flex items-center justify-between mb-6'>
              <h1 className='text-4xl font-extrabold'>Hi there!</h1>
              <div className='flex items-center gap-4'>
                <button
                  aria-label='notifications'
                  className='w-10 h-10 rounded-full bg-white/6 flex items-center justify-center'
                >
                  <svg
                    width='18'
                    height='23'
                    viewBox='0 0 18 23'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M9.10059 1.77417L9.10064 1.06982H9.10059V1.77417ZM15.2832 7.95679L15.9876 7.95679L15.9876 7.95678L15.2832 7.95679ZM16.8477 14.5906L17.552 14.5906L17.552 14.5906L16.8477 14.5906ZM13.6904 18.2937L13.7902 18.9909L13.7902 18.9909L13.6904 18.2937ZM9.09961 18.699L9.09958 19.4033L9.09961 19.4033L9.09961 18.699ZM4.50977 18.2937L4.40993 18.9909L4.40997 18.9909L4.50977 18.2937ZM1.35254 14.5906L0.648191 14.5906L0.648191 14.5906L1.35254 14.5906ZM2.91797 7.95679L2.21362 7.95678V7.95679H2.91797ZM1.94959 12.536L1.35543 12.1577L1.94959 12.536ZM16.2509 12.5367L15.6567 12.9149L16.2509 12.5367ZM9.10059 1.77417L9.10054 2.47852C12.1259 2.47874 14.5788 4.93146 14.5789 7.9568L15.2832 7.95679L15.9876 7.95678C15.9875 4.15337 12.9039 1.0701 9.10064 1.06982L9.10059 1.77417ZM15.2832 7.95679H14.5789V10.0767H15.2832H15.9876V7.95679H15.2832ZM16.2509 12.5367L15.6567 12.9149C15.9648 13.3989 16.1433 13.9727 16.1433 14.5906Л16.8477 14.5906L17.552 14.5906C17.552 13.6968 17.2927 12.8617 16.8451 12.1585L16.2509 12.5367ZM16.8477 14.5906L16.1433 14.5905C16.1432 16.0929 15.0761 17.3838 13.5906 17.5965L13.6904 18.2937L13.7902 18.9909C16.0064 18.6737 17.5518 16.756 17.552 14.5906L16.8477 14.5906ZM13.6904 18.2937L13.5906 17.5965C12.188 17.7972 10.461 17.9946 9.09961 17.9946L9.09961 18.699L9.09961 19.4033C10.5658 19.4033 12.3747 19.1936 13.7902 18.9909L13.6904 18.2937ZM9.09961 18.699L9.09964 17.9946C7.73832 17.9946 6.01204 17.7972 4.60957 17.5965L4.50977 18.2937L4.40997 18.9909C5.82533 19.1935 7.63346 19.4033 9.09958 19.4033L9.09961 18.699ZM4.50977 18.2937L4.6096 17.5965C3.12412 17.3838 2.05701 16.0928 2.05689 14.5905L1.35254 14.5906L0.648191 14.5906C0.648367 16.756 2.19393 18.6736 4.40993 18.9909L4.50977 18.2937Z'
                      fill='white'
                      fillOpacity='0.8'
                    />
                    <path
                      d='M11.0571 20.166C10.6365 20.8261 9.91725 21.2612 9.10061 21.2612C8.28397 21.2612 7.56471 20.8261 7.14409 20.166'
                      stroke='white'
                      strokeOpacity='0.8'
                      strokeWidth='1.4087'
                      strokeLinecap='round'
                    />
                    <circle
                      cx='13.7957'
                      cy='3.88705'
                      r='3.28696'
                      fill='#FD521B'
                    />
                  </svg>
                </button>

                <button
                  aria-label='profile'
                  className='w-12 h-12 rounded-full bg-white/6 flex items-center justify-center'
                >
                  <svg
                    width='30'
                    height='30'
                    viewBox='0 0 30 30'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <g clipPath='url(#clip0_2547_10367)'>
                      <path
                        d='M15.3084 14.0065C17.0952 14.0065 18.6422 13.3657 19.9066 12.1013C21.1706 10.8371 21.8116 9.29029 21.8116 7.5033C21.8116 5.71692 21.1708 4.16991 19.9064 2.90531C18.642 1.64133 17.095 1.00049 15.3084 1.00049C13.5214 1.00049 11.9746 1.64133 10.7104 2.90552C9.44623 4.1697 8.80518 5.71671 8.80518 7.5033C8.80518 9.29029 9.44623 10.8373 10.7104 12.1015C11.975 13.3655 13.522 14.0065 15.3084 14.0065ZM11.8294 4.02427C12.7994 3.05424 13.9373 2.58273 15.3084 2.58273C16.6793 2.58273 17.8174 3.05424 18.7876 4.02427C19.7577 4.9945 20.2294 6.13261 20.2294 7.5033C20.2294 8.87439 19.7577 10.0123 18.7876 10.9825C17.8174 11.9528 16.6793 12.4243 15.3084 12.4243C13.9377 12.4243 12.7998 11.9526 11.8294 10.9825C10.8591 10.0125 10.3874 8.87439 10.3874 7.5033C10.3874 6.13261 10.8591 4.9945 11.8294 4.02427Z'
                        fill='#CFD2D9'
                      />
                      <path
                        d='M26.687 21.7621C26.6505 21.236 26.5768 20.6621 26.4682 20.0561C26.3586 19.4455 26.2175 18.8683 26.0486 18.3407C25.8739 17.7955 25.6368 17.257 25.3433 16.741C25.039 16.2054 24.6814 15.739 24.2801 15.3553C23.8605 14.9538 23.3468 14.631 22.7527 14.3956C22.1607 14.1613 21.5046 14.0427 20.8028 14.0427C20.5271 14.0427 20.2606 14.1558 19.7458 14.4909C19.429 14.6975 19.0584 14.9365 18.6448 15.2008C18.2911 15.4261 17.8119 15.6373 17.2201 15.8284C16.6427 16.0153 16.0565 16.11 15.4776 16.11C14.8992 16.11 14.3129 16.0153 13.7351 15.8284C13.1439 15.6375 12.6646 15.4263 12.3115 15.201C11.9018 14.9392 11.531 14.7002 11.2094 14.4907C10.6951 14.1556 10.4285 14.0425 10.1529 14.0425C9.45087 14.0425 8.79498 14.1613 8.20316 14.3958C7.60949 14.6308 7.09554 14.9536 6.67551 15.3555C6.27424 15.7395 5.91663 16.2056 5.61259 16.741C5.31946 17.257 5.08215 17.7953 4.90747 18.341C4.73876 18.8685 4.59766 19.4455 4.48807 20.0561C4.3793 20.6613 4.30576 21.2354 4.2693 21.7627C4.23346 22.2783 4.21533 22.8149 4.21533 23.3571C4.21533 24.7665 4.66337 25.9075 5.54688 26.749C6.41946 27.5794 7.57385 28.0004 8.97811 28.0004H21.9788C23.3826 28.0004 24.537 27.5794 25.4098 26.749C26.2935 25.9081 26.7416 24.7667 26.7416 23.3569C26.7414 22.8129 26.723 22.2763 26.687 21.7621Z'
                        fill='#CFD2D9'
                      />
                    </g>
                    <defs>
                      <clipPath id='clip0_2547_10367'>
                        <rect
                          width='27'
                          height='27.0001'
                          fill='white'
                          transform='translate(2.00049 1.00049)'
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
              </div>
            </header>

            {/* ===== Top score card ===== */}
            <section className='relative mb-8'>
              <HiteSummaryCard
                score={hiteScore}
                level={level as "Rookie"}
                streakDays={activeStreak}
                weekLabel='This week'
                plansDone={2}
                plansTotal={4}
                timeSpent='1h 15m'
                onShowMore={() => console.log("show more")}
              />
            </section>

            {/* ===== Today's Plan ===== */}
            <section className='mb-8'>
              <h3 className='text-2xl font-bold mb-4'>Today&apos;s Plan</h3>

              {discoverState === "completed" &&
              trainState === "completed" &&
              executeState === "completed" ? (
                <div
                  className='rounded-2xl p-8 flex flex-col items-center justify-center text-center'
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.00))",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <p className='text-white/80 mb-4'>
                    You&apos;re All Done For Today
                  </p>
                  <div className='w-20 h-20 flex items-center justify-center'>
                    <Image src='/check.png' alt='Done' width={80} height={80} />
                  </div>
                </div>
              ) : (
                <div className='relative'>
                  <div
                    className='absolute left-1 top-0 bottom-0 w-1 rounded-full bg-white/10'
                    style={{ transform: "translateX(-50%)" }}
                  />
                  <div className='space-y-4 pl-3'>
                    {/* Discover */}
                    <div
                      className='relative rounded-[999px] px-4 py-3 flex items-center gap-4'
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.00))",
                        border: "1px solid rgba(120,72,255,0.25)",
                      }}
                    >
                      <div className='w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-[#14223f] to-[#2a1a36]'>
                        <Image
                          src='/Discover.png'
                          alt='discover'
                          width={44}
                          height={44}
                        />
                      </div>

                      <div className='flex-1'>
                        <div className='flex items-center justify-between'>
                          <div className='text-lg font-medium'>Discover</div>
                        </div>
                        <div className='text-sm flex gap-2 items-center text-white/60'>
                          <svg
                            width='16'
                            height='17'
                            viewBox='0 0 16 17'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path
                              d='M14.6663 8.49967C14.6663 12.1816 11.6816 15.1663 7.99967 15.1663C4.31778 15.1663 1.33301 12.1816 1.33301 8.49967C1.33301 4.81778 4.31778 1.83301 7.99967 1.83301C11.6816 1.83301 14.6663 4.81778 14.6663 8.49967Z'
                              fill='white'
                              fillOpacity='0.8'
                            />
                            <path
                              fillRule='evenodd'
                              clipRule='evenodd'
                              d='M7.99967 5.33301C8.27582 5.33301 8.49967 5.55687 8.49967 5.83301V8.29257L10.0199 9.81279C10.2152 10.008 10.2152 10.3246 10.0199 10.5199C9.82463 10.7152 9.50805 10.7152 9.31279 10.5199L7.64612 8.85323C7.55235 8.75946 7.49967 8.63228 7.49967 8.49967V5.83301C7.49967 5.55687 7.72353 5.33301 7.99967 5.33301Z'
                              fill='#060502'
                            />
                          </svg>
                          2 minutes
                        </div>
                      </div>

                      <div>
                        {discoverState === "available" ? (
                          <button
                            onClick={onStartDiscover}
                            className='w-12 h-12 rounded-full bg-white flex items-center justify-center shadow'
                            aria-label='Start discover'
                          >
                            <svg
                              width='12'
                              height='12'
                              viewBox='0 0 24 24'
                              fill='none'
                            >
                              <path
                                d='M8 5l8 7-8 7'
                                stroke='#000'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                          </button>
                        ) : discoverState === "completed" ? (
                          <div className='w-12 h-12 rounded-full bg-green-500/90 flex items-center justify-center text-white'>
                            ✓
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Train */}
                    <div
                      className={`relative rounded-[999px] px-4 py-3 flex items-center gap-4 ${
                        trainState === "locked" ? "opacity-60" : ""
                      }`}
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.00))",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div className='w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-[#0b1720] to-[#161122]'>
                        <Image
                          src='/Train.png'
                          alt='train'
                          width={44}
                          height={44}
                        />
                      </div>

                      <div className='flex-1'>
                        <div className='flex items-center justify-between'>
                          <div
                            className={`${
                              trainState === "locked"
                                ? "text-white/60"
                                : "text-white"
                            } text-lg font-medium`}
                          >
                            Train
                          </div>
                          <div className='text-sm flex gap-2 items-center text-white/60'>
                            <svg
                              width='16'
                              height='17'
                              viewBox='0 0 16 17'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M14.6663 8.49967C14.6663 12.1816 11.6816 15.1663 7.99967 15.1663C4.31778 15.1663 1.33301 12.1816 1.33301 8.49967C1.33301 4.81778 4.31778 1.83301 7.99967 1.83301C11.6816 1.83301 14.6663 4.81778 14.6663 8.49967Z'
                                fill='white'
                                fillOpacity='0.8'
                              />
                              <path
                                fillRule='evenodd'
                                clipRule='evenodd'
                                d='M7.99967 5.33301C8.27582 5.33301 8.49967 5.55687 8.49967 5.83301V8.29257L10.0199 9.81279C10.2152 10.008 10.2152 10.3246 10.0199 10.5199C9.82463 10.7152 9.50805 10.7152 9.31279 10.5199L7.64612 8.85323C7.55235 8.75946 7.49967 8.63228 7.49967 8.49967V5.83301C7.49967 5.55687 7.72353 5.33301 7.99967 5.33301Z'
                                fill='#060502'
                              />
                            </svg>
                            2 minutes
                          </div>
                        </div>
                      </div>

                      <div>
                        {trainState === "locked" ? (
                          <div className='w-12 h-12 rounded-full bg-[#28354EB2] flex items-center justify-center text-white/60'>
                            <svg
                              width='14'
                              height='15'
                              viewBox='0 0 14 15'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                fillRule='evenodd'
                                clipRule='evenodd'
                                d='M2.49967 6.70275V5.33301C2.49967 2.84773 4.51439 0.833008 6.99967 0.833008C9.48496 0.833008 11.4997 2.84773 11.4997 5.33301V6.70275C12.2428 6.75825 12.7268 6.89837 13.0806 7.25213C13.6663 7.83791 13.6663 8.78072 13.6663 10.6663C13.6663 12.552 13.6663 13.4948 13.0806 14.0806C12.4948 14.6663 11.552 14.6663 9.66634 14.6663H4.33301C2.44739 14.6663 1.50458 14.6663 0.918794 14.0806C0.333008 13.4948 0.333008 12.552 0.333008 10.6663C0.333008 8.78072 0.333008 7.83791 0.918794 7.25213C1.27255 6.89837 1.7565 6.75825 2.49967 6.70275ZM3.49967 5.33301C3.49967 3.40001 5.06668 1.83301 6.99967 1.83301C8.93267 1.83301 10.4997 3.40001 10.4997 5.33301V6.66872C10.2443 6.66634 9.96735 6.66634 9.66634 6.66634H4.33301C4.032 6.66634 3.75502 6.66634 3.49967 6.66872V5.33301Z'
                                fill='black'
                                fillOpacity='0.8'
                              />
                            </svg>
                          </div>
                        ) : trainState === "available" ? (
                          <button
                            onClick={onStartTrain}
                            className='w-12 h-12 rounded-full bg-white flex items-center justify-center shadow'
                            aria-label='Start train'
                          >
                            <svg
                              width='12'
                              height='12'
                              viewBox='0 0 24 24'
                              fill='none'
                            >
                              <path
                                d='M8 5l8 7-8 7'
                                stroke='#000'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                          </button>
                        ) : (
                          <div className='w-12 h-12 rounded-full bg-green-500/90 flex items-center justify-center text-white'>
                            ✓
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Execute */}
                    <div
                      className={`relative rounded-[999px] px-4 py-3 flex items-center gap-4 ${
                        executeState === "locked" ? "opacity-60" : ""
                      }`}
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.00))",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div className='w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-[#0b1720] to-[#161122]'>
                        <Image
                          src='/Execute.png'
                          alt='execute'
                          width={44}
                          height={44}
                        />
                      </div>

                      <div className='flex-1'>
                        <div className='flex items-center justify-between'>
                          <div
                            className={`${
                              executeState === "locked"
                                ? "text-white/60"
                                : "text-white"
                            } text-lg font-medium`}
                          >
                            Execute
                          </div>
                          <div className='text-sm flex gap-2 items-center text-white/60'>
                            <svg
                              width='16'
                              height='17'
                              viewBox='0 0 16 17'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M14.6663 8.49967C14.6663 12.1816 11.6816 15.1663 7.99967 15.1663C4.31778 15.1663 1.33301 12.1816 1.33301 8.49967C1.33301 4.81778 4.31778 1.83301 7.99967 1.83301C11.6816 1.83301 14.6663 4.81778 14.6663 8.49967Z'
                                fill='white'
                                fillOpacity='0.8'
                              />
                              <path
                                fillRule='evenodd'
                                clipRule='evenodd'
                                d='M7.99967 5.33301C8.27582 5.33301 8.49967 5.55687 8.49967 5.83301V8.29257L10.0199 9.81279C10.2152 10.008 10.2152 10.3246 10.0199 10.5199C9.82463 10.7152 9.50805 10.7152 9.31279 10.5199L7.64612 8.85323C7.55235 8.75946 7.49967 8.63228 7.49967 8.49967V5.83301C7.49967 5.55687 7.72353 5.33301 7.99967 5.33301Z'
                                fill='#060502'
                              />
                            </svg>
                            2 minutes
                          </div>
                        </div>
                      </div>

                      <div>
                        {executeState === "locked" ? (
                          <div className='w-12 h-12 rounded-full bg-[#28354EB2] flex items-center justify-center text-white/60'>
                            <svg
                              width='14'
                              height='15'
                              viewBox='0 0 14 15'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                fillRule='evenodd'
                                clipRule='evenodd'
                                d='M2.49967 6.70275V5.33301C2.49967 2.84773 4.51439 0.833008 6.99967 0.833008C9.48496 0.833008 11.4997 2.84773 11.4997 5.33301V6.70275C12.2428 6.75825 12.7268 6.89837 13.0806 7.25213C13.6663 7.83791 13.6663 8.78072 13.6663 10.6663C13.6663 12.552 13.6663 13.4948 13.0806 14.0806C12.4948 14.6663 11.552 14.6663 9.66634 14.6663H4.33301C2.44739 14.6663 1.50458 14.6663 0.918794 14.0806C0.333008 13.4948 0.333008 12.552 0.333008 10.6663C0.333008 8.78072 0.333008 7.83791 0.918794 7.25213C1.27255 6.89837 1.7565 6.75825 2.49967 6.70275ZM3.49967 5.33301C3.49967 3.40001 5.06668 1.83301 6.99967 1.83301C8.93267 1.83301 10.4997 3.40001 10.4997 5.33301V6.66872C10.2443 6.66634 9.96735 6.66634 9.66634 6.66634H4.33301C4.032 6.66634 3.75502 6.66634 3.49967 6.66872V5.33301Z'
                                fill='black'
                                fillOpacity='0.8'
                              />
                            </svg>
                          </div>
                        ) : executeState === "available" ? (
                          <button
                            onClick={onStartExecute}
                            className='w-12 h-12 rounded-full bg-white flex items-center justify-center shadow'
                            aria-label='Start execute'
                          >
                            <svg
                              width='12'
                              height='12'
                              viewBox='0 0 24 24'
                              fill='none'
                            >
                              <path
                                d='M8 5l8 7-8 7'
                                stroke='#000'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                          </button>
                        ) : (
                          <div className='w-12 h-12 rounded-full bg-green-500/90 flex items-center justify-center text-white'>
                            ✓
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* ===== Coach's Corner ===== */}
            <section style={{ marginBottom: 32 }}>
              <h3 className='text-2xl font-bold mb-4'>Coach&apos;s Corner</h3>
              <div
                className='rounded-2xl p-6 bg-gradient-to-br from-[#151029] to-[#2a1630] border border-white/6 shadow-lg'
                style={{ minHeight: 160 }}
              >
                <h4 className='text-lg font-semibold mb-2'>
                  Composure Under Pressure
                </h4>
                <p className='text-white/70 leading-relaxed mb-4'>
                  Staying calm in tough moments helps you think clearly, make
                  smart decisions, and avoid mistakes. When you&apos;re
                  composed, pressure doesn&apos;t shake you — it sharpens you.
                </p>

                <div className='flex items-center gap-3'>
                  <button className='px-4 py-2 rounded-full bg-white text-black'>
                    Coach Check-ins
                  </button>
                  <button className='px-4 py-2 rounded-full bg-transparent border border-white/10 text-white/80'>
                    Show more
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* МОДАЛКА */}
      {modalVisible && modalFor && (
        <div className='fixed inset-0 z-[999] flex items-center justify-center px-4'>
          <div
            className='absolute inset-0 bg-black/60'
            onClick={() => setModalVisible(false)}
          />
          <div className='relative max-w-md w-full bg-[#1b1b1b] rounded-2xl p-6 shadow-2xl border border-white/6'>
            <h3 className='text-2xl font-bold mb-3 text-center'>
              {modalFor === "train"
                ? "Train Section Unlocked!"
                : "Execute Section Unlocked!"}
            </h3>
            <p className='text-white/70 text-center'>
              {modalFor === "train"
                ? "Track And Grow Your Personal Skills — Now Available In Your Dashboard."
                : "Put your skills to the test — Execute is now available in your dashboard."}
            </p>

            <div className='flex justify-center'>
              <Image src='/lock1.png' alt='lock' width={200} height={200} />
            </div>

            <button
              onClick={onModalAction}
              className='w-full py-3 rounded-full bg-white text-black font-medium'
            >
              {modalFor === "train" ? "Go to Train" : "Go to Execute"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
