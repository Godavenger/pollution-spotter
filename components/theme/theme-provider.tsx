"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import { THEME_COLORS, THEME_STORAGE_KEY } from "./constants";

function BrowserThemeColor() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    // Both media-tagged defaults need the chosen color when a saved preference
    // overrides the OS. Reapply after navigation in case Next replaces metadata.
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
      meta.content = THEME_COLORS[resolvedTheme];
    });
    document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')?.setAttribute("content", resolvedTheme);
  }, [resolvedTheme, pathname]);

  return null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemeProvider
      attribute="data-theme"
      storageKey={THEME_STORAGE_KEY}
      defaultTheme="system"
      enableSystem
      enableColorScheme
      disableTransitionOnChange
    >
      <BrowserThemeColor />
      {children}
    </NextThemeProvider>
  );
}
