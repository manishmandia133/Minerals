// ChatCurtainTransition — GSAP "curtain" page transition, chat page only.
//
// A single full-screen graphite sheet wipes up from the bottom (expo.inOut:
// cover with origin bottom, reveal with origin top). At full cover the site
// logo (footer Minerals mark) animates in with GSAP: the two bars slide in
// from opposite sides, settle with a soft pop, then idle-float until reveal.
// Two flows:
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

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap';

const COVER_DURATION = 0.45;
const REVEAL_DURATION = 0.55;
const HOLD_DELAY = 70;

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
  const topBarRef = useRef(null);
  const bottomBarRef = useRef(null);
  const busyRef = useRef(false);
  const idleTweenRef = useRef(null);

  const stopIdle = () => {
    if (idleTweenRef.current) {
      idleTweenRef.current.kill();
      idleTweenRef.current = null;
    }
  };

  // Snappy float while covered (killed on reveal) — quick and tight.
  const startIdle = () => {
    stopIdle();
    gsap.set(logoRef.current, { y: 0 });
    idleTweenRef.current = gsap.to(logoRef.current, {
      y: -4,
      duration: 0.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  };

  // Cover half: sheet wipes UP; logo bars slide in from opposite sides.
  const cover = () =>
    new Promise((resolve) => {
      stopIdle();
      const tl = gsap.timeline({
        onComplete: () => {
          busyRef.current = false;
          resolve();
        },
      });
      tl.set(rootRef.current, { display: 'block' })
        .set(sheetRef.current, { transformOrigin: '50% 100%' })
        .set(logoRef.current, { opacity: 0, y: 10, scale: 0.9, transformOrigin: '50% 50%' })
        .set(topBarRef.current, { x: 48, opacity: 0 })
        .set(bottomBarRef.current, { x: -48, opacity: 0 })
        .to(sheetRef.current, {
          scaleY: 1,
          duration: COVER_DURATION,
          ease: 'power4.inOut',
        })
        // Logo container pops in as the sheet lands
        .to(
          logoRef.current,
          { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: 'back.out(2)' },
          '-=0.22'
        )
        // Top bar sweeps in from the right
        .to(
          topBarRef.current,
          { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' },
          '<'
        )
        // Bottom bar sweeps in from the left, slightly staggered
        .to(
          bottomBarRef.current,
          { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' },
          '<0.06'
        )
        .add(() => startIdle());
    });

  // Reveal half: bars split back out, mark lifts away, sheet follows up.
  const reveal = () =>
    new Promise((resolve) => {
      stopIdle();
      const tl = gsap.timeline({
        onComplete: () => {
          busyRef.current = false;
          resolve();
        },
      });
      tl.to(
          topBarRef.current,
          { x: 28, opacity: 0, duration: 0.2, ease: 'power3.in' },
          0
        )
        .to(
          bottomBarRef.current,
          { x: -28, opacity: 0, duration: 0.2, ease: 'power3.in' },
          0
        )
        .to(
          logoRef.current,
          {
            opacity: 0,
            y: -12,
            scale: 0.96,
            duration: 0.2,
            ease: 'power3.in',
          },
          0
        )
        .set(sheetRef.current, { transformOrigin: '50% 0%' })
        .to(sheetRef.current, {
          scaleY: 0,
          duration: REVEAL_DURATION,
          ease: 'power4.inOut',
        })
        .set(rootRef.current, { display: 'none' });
    });

  useImperativeHandle(ref, () => ({
    isBusy: () => busyRef.current,

    // Full chat transition: cover current page → run navigate → reveal next.
    transitionTo: async (navigateFn) => {
      if (busyRef.current || prefersReducedMotion()) {
        navigateFn();
        return;
      }
      busyRef.current = true;
      await cover();
      navigateFn();
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      // Let the new route paint under the cover before lifting it.
      await new Promise((r) => setTimeout(r, HOLD_DELAY));
      busyRef.current = true;
      await reveal();
    },

    // Intro-only: page already swapped (direct load, refresh, browser
    // back/forward) — start covered so the snap is hidden, then lift.
    playIntro: async () => {
      if (prefersReducedMotion()) return;
      if (busyRef.current) return;
      busyRef.current = true;
      gsap.set(rootRef.current, { display: 'block' });
      gsap.set(sheetRef.current, { transformOrigin: '50% 100%', scaleY: 1 });
      gsap.set(logoRef.current, { opacity: 1, y: 0, scale: 1 });
      gsap.set(topBarRef.current, { x: 0, opacity: 1 });
      gsap.set(bottomBarRef.current, { x: 0, opacity: 1 });
      await reveal();
    },
  }));

  return (
    <div ref={rootRef} className="chat-curtain" aria-hidden="true">
      <div ref={sheetRef} className="chat-curtain-sheet" />
      <div className="chat-curtain-center">
        {/* Site logo: footer Minerals mark in paper (#f0f1fa).
            Inline SVG so GSAP can animate each bar independently. */}
        <div ref={logoRef} className="chat-curtain-logo" style={{ color: '#f0f1fa' }}>
          <svg viewBox="0 0 64 38" style={{ color: '#f0f1fa', display: 'block' }} role="presentation">
            <path
              ref={bottomBarRef}
              d="M0 20.1032L39.8387 20.1032C44.7808 20.1032 48.7871 24.1095 48.7871 29.0516C48.7871 33.9937 44.7808 38 39.8387 38L1.56459e-06 38L0 20.1032Z"
              fill="currentColor"
            />
            <path
              ref={topBarRef}
              d="M63.4968 17.8968L23.6581 17.8968C18.716 17.8968 14.7097 13.8904 14.7097 8.94839C14.7097 4.00633 18.716 0 23.6581 0L63.4968 0V17.8968Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </div>
  );
});

export default ChatCurtainTransition;
