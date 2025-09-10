"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import LandingScreen from "@/components/LandingPage";

const images = [
  "/Ghome.png",
  "/Email.png",
  "/App-Store.png",
  "/App-Store1.png",
  "/App-Store2.png",
  "/Splash-Screen.png",
];

export default function Page() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showLanding, setShowLanding] = useState(false);

  const goNext = useCallback(() => {
    const next = activeIndex + 1;
    if (next >= images.length) {
      setShowLanding(true);
    } else {
      setActiveIndex(next);
    }
  }, [activeIndex]);

  if (showLanding) {
    return <LandingScreen />;
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black overflow-hidden">
      <div className="w-full max-w-[420px] h-full max-h-screen rounded-xl overflow-hidden relative">
        <button
          type="button"
          aria-label="Advance image"
          onClick={goNext}
          className="relative h-full w-full block p-0 m-0 border-0 bg-transparent cursor-pointer focus:outline-none"
        >
          <div className="absolute inset-0">
            {images.map((src, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={src}
                  className={`absolute inset-0 transition-opacity duration-600 ease-in-out ${
                    isActive ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                  aria-hidden={!isActive}
                >
                  <Image
                    src={src}
                    alt={`slide-${idx + 1}`}
                    fill
                    style={{ objectFit: "cover" }}
                    priority={idx === 0}
                  />
                </div>
              );
            })}
          </div>
        </button>
      </div>
    </div>
  );
}
