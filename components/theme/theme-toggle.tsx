"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { UI_EASE, useQuietMotion } from "@/components/ui/motion";
import "./theme.css";

const subscribe = () => () => undefined;
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function ThemeToggle({ className = "" }: { className?: string }) {
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const { theme, resolvedTheme, systemTheme, forcedTheme, setTheme } = useTheme();
  const quiet = useQuietMotion();
  const ready = hydrated && (resolvedTheme === "dark" || resolvedTheme === "light");
  const dark = resolvedTheme === "dark";
  const title = ready
    ? `${theme === "system" ? "Following system appearance. " : ""}Switch to ${dark ? "light" : "dark"} mode`
    : "Use light or dark appearance";

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      aria-label="Toggle dark mode"
      aria-pressed={ready ? dark : undefined}
      title={title}
      disabled={!ready || Boolean(forcedTheme)}
      onClick={() => setTheme((current) => (current === "system" ? systemTheme : current) === "dark" ? "light" : "dark")}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {ready ? (
          <AnimatePresence initial={false}>
            <m.span
              key={dark ? "dark" : "light"}
              className="theme-toggle-glyph"
              initial={{ opacity: 0, transform: quiet ? "none" : "rotate(-25deg) scale(.85)" }}
              animate={{ opacity: 1, transform: "rotate(0deg) scale(1)" }}
              exit={{ opacity: 0, transform: quiet ? "none" : "rotate(25deg) scale(.85)" }}
              transition={{ duration: quiet ? 0 : .16, ease: UI_EASE }}
            >
              {dark ? <Moon size={18} strokeWidth={1.7} /> : <Sun size={18} strokeWidth={1.7} />}
            </m.span>
          </AnimatePresence>
        ) : (
          <span className="theme-toggle-fallback">
            <Sun className="theme-toggle-sun" size={18} strokeWidth={1.7} />
            <Moon className="theme-toggle-moon" size={18} strokeWidth={1.7} />
          </span>
        )}
      </span>
      <span className="theme-toggle-label">Dark mode</span>
    </button>
  );
}
