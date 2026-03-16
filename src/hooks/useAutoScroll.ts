import { useEffect, useRef, useCallback } from "react";

export function useAutoScroll<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T>(null);
  const userScrolledUp = useRef(false);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const threshold = 100;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    userScrolledUp.current = distFromBottom > threshold;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const el = ref.current;
    if (el && !userScrolledUp.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [dep]);

  return ref;
}
