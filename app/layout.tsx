// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { DM_Sans } from "next/font/google";
import Image from "next/image";
import Bg from "../public/quiz-bg.png";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DTE 1",
  description: "App description here",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className='h-full'>
      <body
        className={`
          ${dmSans.className}
          min-h-[100dvh] bg-black text-white
          antialiased
        `}
      >
        {/* Фон: картинка + тёмно-синий градиент как на макете */}
        <div className='relative min-h-[100dvh]'>
          <Image
            src={Bg}
            alt='Background'
            fill
            className='object-cover'
            priority
            quality={100}
          />
          <div
            className='
              absolute inset-0
              bg-[radial-gradient(120%_120%_at_50%_-10%,rgba(22,76,130,0.55),rgba(0,0,0,0.92)_65%)]
              mix-blend-normal
            '
          />
          {/* Контент без вертикального скролла страницы */}
          <main className='relative z-10 min-h-[100dvh] overflow-hidden'>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
