import type { Metadata, Viewport } from "next";
import "@fontsource-variable/instrument-sans";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { THEME_COLORS } from "@/components/theme/constants";

export const metadata: Metadata = {
  title: "Pollution Spotter — Water observations, human reviewed",
  description: "Document visible water pollution, review your observation, and share it on a community map. Photos stay private.",
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1, viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
  colorScheme: "light dark", interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body><ThemeProvider><AppShell>{children}</AppShell></ThemeProvider></body></html>;
}
