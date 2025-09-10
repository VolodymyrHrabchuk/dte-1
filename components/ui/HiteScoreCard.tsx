// HiteScoreCard.tsx
"use client";

import { motion } from "framer-motion";
import HITEIcon from "@/components/icons/HITEIcon";

const EASE = [0.16, 1, 0.3, 1] as const;

type Props = {
  score: number; // уже подсчитанный HITE score
};

export default function HiteScoreCard({ score }: Props) {
  return (
    <motion.div
      className='w-full flex flex-col py-4 px-3 border border-violet rounded-2xl relative overflow-hidden'
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
      aria-labelledby='hite-score-title'
      role='region'
    >
      {/* bg art */}
      <div
        className='absolute inset-0 pointer-events-none'
        style={{
          backgroundImage: `url('/hite-score-bg.png')`,
          backgroundSize: "290px 140px",
          backgroundPosition: "right bottom",
          backgroundRepeat: "no-repeat",
          opacity: 0.9,
        }}
      />

      {/* top row only: title + Rookie badge + score */}
      <div className='relative z-10'>
        <div className='flex flex-row items-center justify-between'>
          <div className='flex items-center gap-2'>
            <HITEIcon />
            <span id='hite-score-title' className='font-medium text-lg'>
              HITE Score
            </span>

            {/* fixed Rookie badge */}
            <motion.span
              initial={{ opacity: 0, y: 6, scale: 0.95, rotateX: -40 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              transition={{ duration: 0.35, ease: EASE, delay: 0.2 }}
              className='inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium text-[10px]'
              style={{ backgroundColor: "#363391", color: "#B2FF8B" }}
              aria-label='Level: Rookie'
            >
              🌱 Rookie
            </motion.span>
          </div>

          {/* score */}
          <motion.span
            className='font-medium text-2xl tabular-nums'
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
            aria-label={`Score ${score.toLocaleString()}`}
          >
            {score.toLocaleString()}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}
