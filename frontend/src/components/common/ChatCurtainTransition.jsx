// ChatCurtainTransition — GSAP "curtain" page transition, chat page only.
//
// A single full-screen graphite sheet wipes up from the bottom (expo.inOut:
// cover with origin bottom, reveal with origin top). At full cover the site
// favicon mark draws itself in (hexagon stroke draw-on + core dot pop)
// above a route-aware caption. Two flows:
//
//   • intro — entering /chat:  cover(old page) → navigate → reveal(chat)
//   • outro — leaving  /chat:  cover(chat)     → navigate → reveal(page)
//
// The overlay lives at App level (outside <Routes/>) so it survives the
// route swap. Parent drives it imperatively via ref:
//   curtainRef.current.transitionTo(navigateFn, label)
//   curtainRef.current.playIntro(label)  // direct load / popstate:
//                                       // start covered, reveal only
// Reduced-motion users skip animation and navigate instantly.

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap';

const COVER_DURATION = 0.7;
const REVEAL_DURATION = 0.85;

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

const ChatCurtainTransition = forwardRef(function ChatCurtainTransition(_, ref) {
  const rootRef = useRef(null);
  const sheetRef = useRef(null);
  const logoRef = useRef(null);
  const hexRef = useRef(null);
  const dotRef = useRef(null);
  const captionRef = useRef(null);
  const busyRef = useRef(false);
  const hexLenRef = useRef(320);

  // Outro half: the sheet wipes UP from the bottom; mark draws in at cover.
  const cover = (label) =>
    new Promise((resolve) => {
      const hexLen = hexLenRef.current;
      const tl = gsap.timeline({
        onComplete: () => {
          busyRef.current = false;
          resolve();
        },
      });
      tl.set(rootRef.current, { display: 'block' })
        .add(() => setCaption(label))
        .set(sheetRef.current, { transformOrigin: '50% 100%' })
        .set(logoRef.current, { opacity: 0, scale: 0.94, transformOrigin: '50% 50%' })
        .set(hexRef.current, { strokeDasharray: hexLen, strokeDashoffset: hexLen })
        .set(dotRef.current, { scale: 0, transformOrigin: '50% 50%' })
        .set(captionRef.current, { opacity: 0, y: 12 })
        .to(sheetRef.current, {
          scaleY: 1,
          duration: COVER_DURATION,
          ease: 'expo.inOut',
        })
        .to(
          logoRef.current,
          { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' },
          '-=0.32'
        )
        .to(
          hexRef.current,
          { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' },
          '<'
        )
        .to(
          dotRef.current,
          { scale: 1, duration: 0.45, ease: 'back.out(1.7)' },
          '-=0.35'
        )
        .to(
          captionRef.current,
          { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' },
          '-=0.3'
        );
    });

  // Intro half: mark lifts away, the sheet follows toward the top.
  const reveal = () =>
    new Promise((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          busyRef.current = false;
          resolve();
        },
      });
      tl.to(logoRef.current, {
        opacity: 0,
        y: -16,
        scale: 0.96,
        duration: 0.3,
        ease: 'power2.in',
      })
        .to(
          captionRef.current,
          { opacity: 0, y: -10, duration: 0.28, ease: 'power2.in' },
          '<'
        )
        .set(sheetRef.current, { transformOrigin: '50% 0%' })
        .to(sheetRef.current, {
          scaleY: 0,
          duration: REVEAL_DURATION,
          ease: 'expo.inOut',
        })
        .set(rootRef.current, { display: 'none' });
    });

  // Measure the hexagon perimeter once so the draw-on tween is exact.
  useEffect(() => {
    try {
      const len = hexRef.current?.getTotalLength?.();
      if (len && Number.isFinite(len)) hexLenRef.current = len;
    } catch {
      /* keep fallback */
    }
  }, []);

  const setCaption = (label) => {
    if (captionRef.current) captionRef.current.textContent = label;
  };

  useImperativeHandle(ref, () => ({
    isBusy: () => busyRef.current,

    // Full chat transition: cover current page → run navigate → reveal next.
    transitionTo: async (navigateFn, label = 'AI ASSISTANT') => {
      if (busyRef.current || prefersReducedMotion()) {
        navigateFn();
        return;
      }
      busyRef.current = true;
      await cover(label);
      navigateFn();
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      // Let the new route paint under the cover before lifting it.
      await new Promise((r) => setTimeout(r, 140));
      busyRef.current = true;
      await reveal();
    },

    // Intro-only: page already swapped (direct load, refresh, browser
    // back/forward) — start covered so the snap is hidden, then lift.
    playIntro: async (label = 'AI ASSISTANT') => {
      if (prefersReducedMotion()) return;
      if (busyRef.current) return;
      busyRef.current = true;
      setCaption(label);
      gsap.set(rootRef.current, { display: 'block' });
      gsap.set(sheetRef.current, { transformOrigin: '50% 100%', scaleY: 1 });
      gsap.set(logoRef.current, { opacity: 1, y: 0, scale: 1 });
      gsap.set(hexRef.current, {
        strokeDasharray: hexLenRef.current,
        strokeDashoffset: 0,
      });
      gsap.set(dotRef.current, { scale: 1 });
      gsap.set(captionRef.current, { opacity: 1, y: 0 });
      await reveal();
    },
  }));

  return (
    <div ref={rootRef} className="chat-curtain" aria-hidden="true">
      <div ref={sheetRef} className="chat-curtain-sheet" />
      <div className="chat-curtain-center">
        {/* Favicon mark: paper hexagon with the site-wide Electric Indigo
            core (#1a2ffb — the blue used across all pages). */}
        <div ref={logoRef} className="chat-curtain-logo">
          <svg viewBox="0 0 100 100" role="presentation">
            <polygon
              ref={hexRef}
              points="50,5 95,28 95,72 50,95 5,72 5,28"
              fill="none"
              stroke="#f0f1fa"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <circle ref={dotRef} cx="50" cy="50" r="18" fill="#1a2ffb" />
          </svg>
        </div>
        <span ref={captionRef} className="chat-curtain-sub">
          AI ASSISTANT
        </span>
      </div>
    </div>
  );
});

export default ChatCurtainTransition;
