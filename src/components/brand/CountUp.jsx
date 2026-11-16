import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Animated number.
 *
 *   <CountUp value={1280} prefix="LKR " />
 *   <CountUp value={total} decimals={2} />
 *
 * The value eases from the previous number to the new one. When the user
 * prefers reduced motion the number simply shows its final value.
 */
export function CountUp({
  value,
  duration = 900,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}) {
  const target = Number.isFinite(Number(value)) ? Number(value) : 0;
  const [display, setDisplay] = useState(target);
  const frameRef = useRef(null);
  const previousRef = useRef(target);

  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches),
    [],
  );

  useEffect(() => {
    if (reducedMotion || duration <= 0) {
      previousRef.current = target;
      return undefined;
    }

    const from = previousRef.current;
    const delta = target - from;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setDisplay(from + delta * eased);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        previousRef.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, reducedMotion]);

  const shown = reducedMotion || duration <= 0 ? target : display;

  return (
    <span className={className}>
      {prefix}
      {shown.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

export default CountUp;
