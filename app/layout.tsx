import type { Metadata, Viewport } from "next";
import "@fontsource-variable/instrument-sans";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Pollution Spotter — Water observations, human reviewed",
  description: "Document visible water pollution, review your observation, and share it on a community map. Photos stay private.",
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1, viewportFit: "cover",
  themeColor: "#ffffff", colorScheme: "light", interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AppShell>{children}</AppShell></body></html>;
}
