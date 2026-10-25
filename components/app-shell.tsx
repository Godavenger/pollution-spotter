"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Plus, BookOpen, ArrowUpRight } from "lucide-react";

const destinations = [
  { href: "/", label: "New report", icon: Plus },
  { href: "/map", label: "Community map", icon: Map },
  { href: "/guide", label: "Field guide", icon: BookOpen },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className="app-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <aside className="sidebar">
      <Link href="/" className="brand" aria-label="Pollution Spotter home">
        <svg className="brand-mark" viewBox="0 0 36 42" fill="none" aria-hidden="true">
          <path d="M18 2C10 2 4 8 4 16c0 10 14 22 14 22s14-12 14-22C32 8 26 2 18 2Z" stroke="currentColor" strokeWidth="2.3"/>
          <path d="M10 16c3-4 5 4 8 0s5 4 8 0M11 21c3-4 5 4 8 0s4 3 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>Pollution <br />Spotter<span className="brand-caption">A clearer picture of our water</span></span>
      </Link>
      <nav aria-label="Main navigation">
        {destinations.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className="nav-link"><Icon size={18} strokeWidth={1.7} /><span>{label}</span></Link>)}
      </nav>
      <div className="sidebar-note">
        <p>Small observations.<br />A shared responsibility.</p>
        <span>Starting in Kolkata.<br />Open to reports everywhere.</span>
        <a href="https://www.openstreetmap.org/about" target="_blank" rel="noreferrer">Maps by OpenStreetMap <ArrowUpRight size={13} /></a>
      </div>
    </aside>
    <main id="main" className="main-content">{children}</main>
  </div>;
}
