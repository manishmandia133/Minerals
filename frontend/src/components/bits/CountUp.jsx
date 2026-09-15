import { useInView, useMotionValue, useSpring } from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';
import { isLaunchWindow } from './countUpSession';

// Count-up that animates exactly once per mount. Later `to` changes
// (e.g. live filter stats) snap to the final value with no replay.
export default function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  onStart,
  onEnd
}) {
  const ref = useRef(null);
  // Animate only during the initial website launch window; later mounts
  // render the final value immediately (animation plays once per launch).
  const animateOnLaunch = startWhen && isLaunchWindow();
  const startValue = direction === 'down' ? to : from;
  const endValue = direction === 'down' ? from : to;
  const motionValue = useMotionValue(animateOnLaunch ? startValue : endValue);
  const playedRef = useRef(false);
  const unsubRef = useRef(null);

  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);

  const springValue = useSpring(motionValue, {
    damping,
    stiffness
  });

  const isInView = useInView(ref, { once: true, margin: '0px' });

  const getDecimalPlaces = num => {
    const str = num.toString();

    if (str.includes('.')) {
      const decimals = str.split('.')[1];

      if (parseInt(decimals) !== 0) {
        return decimals.length;
      }
    }

    return 0;
  };

  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to));

  const formatValue = useCallback(
    latest => {
      const hasDecimals = maxDecimals > 0;

      const options = {
        useGrouping: !!separator,
        minimumFractionDigits: hasDecimals ? maxDecimals : 0,
        maximumFractionDigits: hasDecimals ? maxDecimals : 0
      };

      const formattedNumber = Intl.NumberFormat('en-US', options).format(latest);

      return separator ? formattedNumber.replace(/,/g, separator) : formattedNumber;
    },
    [maxDecimals, separator]
  );

  useEffect(() => {
    if (ref.current && !playedRef.current) {
      ref.current.textContent = formatValue(animateOnLaunch ? startValue : endValue);
    }
  }, [from, to, direction, formatValue, animateOnLaunch, startValue, endValue]);

  useEffect(() => {
    if (isInView && animateOnLaunch && !playedRef.current) {
      if (typeof onStart === 'function') onStart();

      const timeoutId = setTimeout(() => {
        // Flag set here (not in the effect body) so React StrictMode's
        // mount-unmount-remount cycle in dev doesn't swallow the run.
        playedRef.current = true;
        motionValue.set(direction === 'down' ? from : to);
      }, delay * 1000);

      const durationTimeoutId = setTimeout(
        () => {
          if (unsubRef.current) {
            unsubRef.current();
            unsubRef.current = null;
          }
          if (typeof onEnd === 'function') onEnd();
        },
        delay * 1000 + duration * 1000
      );

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(durationTimeoutId);
      };
    }
  }, [isInView, animateOnLaunch, motionValue, direction, from, to, delay, onStart, onEnd, duration]);

  // After the one-time run, value changes snap instead of replaying.
  useEffect(() => {
    if (playedRef.current && ref.current) {
      ref.current.textContent = formatValue(to);
      motionValue.set(to);
    }
  }, [to, from, direction, formatValue, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', latest => {
      if (ref.current) {
        ref.current.textContent = formatValue(latest);
      }
    });
    unsubRef.current = unsubscribe;

    return () => {
      unsubscribe();
      unsubRef.current = null;
    };
  }, [springValue, formatValue]);

  return <span className={className} ref={ref} />;
}
