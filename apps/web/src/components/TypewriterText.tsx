'use client';

import { useEffect, useRef, useState } from 'react';

interface TypewriterTextProps {
  phrases: string[];
  /** ms to type one character */
  typeSpeed?: number;
  /** ms to erase one character */
  eraseSpeed?: number;
  /** ms to wait before erasing after fully typed */
  holdDuration?: number;
  /** ms to wait after fully erased before next phrase */
  pauseDuration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function TypewriterText({
  phrases,
  typeSpeed = 55,
  eraseSpeed = 30,
  holdDuration = 2000,
  pauseDuration = 400,
  className,
  style,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'holding' | 'erasing' | 'pausing'>('typing');
  const [charIndex, setCharIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!phrases.length) return;

    const current = phrases[phraseIndex];

    const tick = () => {
      if (phase === 'typing') {
        if (charIndex < current.length) {
          setDisplayed(current.slice(0, charIndex + 1));
          setCharIndex(i => i + 1);
          timerRef.current = setTimeout(tick, typeSpeed);
        } else {
          setPhase('holding');
          timerRef.current = setTimeout(tick, holdDuration);
        }
      } else if (phase === 'holding') {
        setPhase('erasing');
        timerRef.current = setTimeout(tick, eraseSpeed);
      } else if (phase === 'erasing') {
        if (charIndex > 0) {
          const newLen = charIndex - 1;
          setDisplayed(current.slice(0, newLen));
          setCharIndex(newLen);
          timerRef.current = setTimeout(tick, eraseSpeed);
        } else {
          setPhase('pausing');
          timerRef.current = setTimeout(tick, pauseDuration);
        }
      } else if (phase === 'pausing') {
        setPhraseIndex(i => (i + 1) % phrases.length);
        setCharIndex(0);
        setPhase('typing');
        timerRef.current = setTimeout(tick, typeSpeed);
      }
    };

    timerRef.current = setTimeout(tick, phase === 'pausing' ? pauseDuration : typeSpeed);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, charIndex, phraseIndex, phrases, typeSpeed, eraseSpeed, holdDuration, pauseDuration]);

  return (
    <span className={className} style={style}>
      {displayed}
      <span className="typewriter-cursor" aria-hidden="true">|</span>
    </span>
  );
}
