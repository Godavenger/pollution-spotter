"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Plus, BookOpen, ArrowUpRight } from "lucide-react";
import { LayoutGroup, m } from "framer-motion";
import { MotionSystem, UI_EASE, useQuietMotion } from "@/components/ui/motion";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const destinations = [
  { href: "/", label: "New report", icon: Plus },
  { href: "/map", label: "Community map", icon: Map },
  { href: "/guide", label: "Field guide", icon: BookOpen },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return <MotionSystem><Shell>{children}</Shell></MotionSystem>;
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const quiet = useQuietMotion();
  return <div className="app-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <aside className="sidebar">
      <div className="brand-block"><Link href="/" className="brand" aria-label="Pollution Spotter home">
        <svg className="brand-mark" viewBox="0 0 36 42" fill="none" aria-hidden="true">
          <path d="M18 2C10 2 4 8 4 16c0 10 14 22 14 22s14-12 14-22C32 8 26 2 18 2Z" stroke="currentColor" strokeWidth="2.3"/>
          <path d="M10 16c3-4 5 4 8 0s5 4 8 0M11 21c3-4 5 4 8 0s4 3 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>Pollution <br />Spotter</span>
      </Link><p className="brand-caption">A clearer picture of our water</p></div>
      <LayoutGroup id="main-navigation"><nav aria-label="Main navigation">
        {destinations.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className="nav-link">{pathname === href && <m.span className="nav-selection" layoutId="selection" initial={false} transition={{ duration: quiet ? 0 : .18, ease: UI_EASE }} aria-hidden="true" />}<Icon size={18} strokeWidth={1.7} /><span className="nav-label">{label}</span></Link>)}
      </nav></LayoutGroup>
      <div className="sidebar-tools"><ThemeToggle />
      <div className="sidebar-note">
        <p>Small observations.<br />A shared responsibility.</p>
        <span>Starting in Kolkata.<br />Open to reports everywhere.</span>
        <a href="https://www.openstreetmap.org/about" target="_blank" rel="noreferrer">Maps by OpenStreetMap <ArrowUpRight size={13} /></a>
      </div></div>
    </aside>
    <main id="main" className="main-content">{children}</main>
  </div>;
}
