// app/components/LandingPage.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Logo from "../public/mainLogo.svg";
import Hero from "../public/landing.svg"; // верхняя картинка внутри карточки
import CardBg from "../public/background.svg"; // лёгкий шум/блюр внутри карточки (опционально)

export default function LandingPage() {
  const router = useRouter();
  const goToStepTwo = () => router.push("/assessments");

  return (
    <div
      className='
        flex items-center justify-center
         min-h-[100dvh]
        px-3 sm:px-6
        pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]
      '
    >
      {/* Карточка как на референсе, полностью влезает по высоте */}
      <div
        className='
          relative
          w-[min(94vw,480px)]
          h-[min(98dvh,780px)]
          rounded-[28px]
          border border-white/15
          bg-black/55 backdrop-blur-xl
          shadow-[0_10px_30px_rgba(0,0,0,0.65)]
          overflow-hidden
          flex
        '
        role='group'
        aria-label='Welcome card'
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {/* Внутренний фоновый слой карточки (лёгкая текстура/свечение) */}
        <Image
          src={CardBg}
          alt=''
          fill
          className='absolute inset-0 -z-10 object-cover opacity-20'
          priority
        />

        {/* Контент карточки → сетка по референсу: картинка / контент / кнопка */}
        <div className='flex flex-col h-full w-full p-4 sm:p-6'>
          {/* Верхняя картинка с радиусом и рамкой */}
          <div
            className='
              rounded-2xl overflow-hidden
              ring-1 ring-white/15
              shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]
              bg-black/20
            '
          >
            <div className='relative w-full aspect-square  max-h-[54dvh]'>
              <Image
                src={Hero}
                alt='Basketball player'
                fill
                className='object-cover'
                priority
              />
            </div>
          </div>

          {/* Логотип и слоган */}
          <div className='mt-5 sm:mt-6 text-center'>
            <Image
              src={Logo}
              alt='HITE EQ'
              className='mx-auto w-[160px] sm:w-[190px] h-auto'
              priority
            />
          </div>

          {/* Текстовые блоки — размеры с clamp, чтобы всегда помещались */}
          <h2
            className='
              mt-8
              text-center font-medium
              text-lg
              text-white
            '
          >
            What gets measured, gets improved.
          </h2>

          <p
            className='
              mt-3
              text-center
              text-white/90
              text-lg
              leading-relaxed
              px-1
            '
          >
            The following short assessment helps HITE and your coach tailor
            trainings to your needs. It takes a few minutes to complete and then
            we&apos;ll get you into the app.
          </p>

          {/* Кнопка прибита к низу, но вся карточка на 1 экран */}
          <div className='mt-auto pt-4'>
            <button
              onClick={goToStepTwo}
              className='
                w-full h-12 sm:h-12
                rounded-full
                bg-white text-black font-medium
                text-[clamp(16px,4.2vw,18px)]
                ring-1 ring-black/5
                shadow-[0_1px_0_0_rgba(255,255,255,0.55)_inset,0_-10px_30px_rgba(255,255,255,0.18)_inset]
                hover:bg-white/95 active:translate-y-[1px]
                focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
              '
              aria-label='Start assessment'
            >
              Start
            </button>
          </div>
        </div>

        {/* Внешняя тонкая внутренняя обводка по референсу */}
        <div className='pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-white/10' />
      </div>
    </div>
  );
}
