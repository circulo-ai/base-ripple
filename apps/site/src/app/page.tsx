'use client';

import { useEffect, useRef } from 'react';
import { attachBaseRipple } from '@base-ripple/core';

export default function Home() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!buttonRef.current) return;
    return attachBaseRipple(buttonRef.current, {
      origin: 'pointer',
      sizeOffset: 96, // since the blur is 16, multiplying it by 6 gives 96
    });
  }, []);

  return (
    <div className="w-dvw h-dvh p-16">
      <button
        ref={buttonRef}
        className="base-ripple-container [&>.base-ripple]:bg-white/10 [&>.base-ripple]:blur-lg size-full flex items-center justify-center text-center text-white bg-black"
      >
        Hello World!
      </button>
    </div>
  );
}
