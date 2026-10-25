"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { domMax, LazyMotion, m, MotionConfig, useIsPresent, useReducedMotion } from "framer-motion";

export const UI_EASE = [0.23, 1, 0.32, 1] as const;
const KeyboardInput = createContext(false);

export function MotionSystem({ children }: { children: ReactNode }) {
  const [keyboard, setKeyboard] = useState(false);
  useEffect(() => {
    const pointer = () => { document.documentElement.dataset.input = "pointer"; setKeyboard(false); };
    const key = () => { document.documentElement.dataset.input = "keyboard"; setKeyboard(true); };
    window.addEventListener("pointerdown", pointer, true);
    window.addEventListener("keydown", key, true);
    return () => { window.removeEventListener("pointerdown", pointer, true); window.removeEventListener("keydown", key, true); };
  }, []);
  return <KeyboardInput.Provider value={keyboard}><LazyMotion features={domMax}><MotionConfig reducedMotion="user">{children}</MotionConfig></LazyMotion></KeyboardInput.Provider>;
}

export function useQuietMotion() {
  const reduced = useReducedMotion();
  const keyboard = useContext(KeyboardInput);
  return Boolean(reduced || keyboard);
}

/** Occasional state changes: short, symmetric exits; retired controls leave the tab order. */
export function PresencePanel({ children, className, focusHeading = false }: { children: ReactNode; className?: string; focusHeading?: boolean }) {
  const quiet = useQuietMotion();
  const keyboard = useContext(KeyboardInput);
  const present = useIsPresent();
  const surface = useRef<HTMLDivElement>(null);
  const focused = useRef(false);
  useLayoutEffect(() => {
    if (present && focusHeading && !focused.current) {
      surface.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus();
      focused.current = true;
    }
  }, [present, focusHeading]);
  return <m.div ref={surface} className={className} inert={!present}
    initial={{ opacity: 0, transform: quiet ? "none" : "translateY(6px)" }}
    animate={{ opacity: 1, transform: "translateY(0px)" }}
    exit={{ opacity: 0, transform: quiet ? "translateY(0px)" : "translateY(6px)", transition: { duration: keyboard ? 0 : .1 } }}
    transition={{ duration: keyboard ? 0 : quiet ? .1 : .18, ease: UI_EASE }}>
    {children}
  </m.div>;
}
