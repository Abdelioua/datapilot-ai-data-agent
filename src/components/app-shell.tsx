"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Database, History, LayoutDashboard, Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ask-data", label: "Ask Data", icon: Sparkles },
  { href: "/data-sources", label: "Data Sources", icon: Database },
  { href: "/agent-runs", label: "Agent Runs", icon: History },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#17202b]">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-[248px] flex-col border-r border-[#e5e8ec] bg-white px-4 py-5 transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-3">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
            <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[#193c35] text-white shadow-sm"><BarChart3 size={17} strokeWidth={2.5} /></span>
            <span className="text-[17px] font-semibold tracking-[-0.03em]">DataPilot</span>
          </Link>
          <button className="grid h-8 w-8 place-items-center rounded-lg text-[#74808b] hover:bg-[#f1f3f4] lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="mt-10 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#98a1aa]">Workspace</div>
        <nav className="mt-3 space-y-1">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === href : pathname.startsWith(href);
            return <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[13px] font-medium transition-colors ${active ? "bg-[#e8f2ef] text-[#1b5b4e]" : "text-[#697580] hover:bg-[#f5f6f7] hover:text-[#27323b]"}`}><Icon size={17} strokeWidth={active ? 2.2 : 1.8} />{label}{label === "Ask Data" && <span className="ml-auto rounded bg-[#d4e8e2] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#277462]">AI</span>}</Link>;
          })}
        </nav>
        <div className="mt-auto rounded-[10px] border border-[#e4e8e9] bg-[#f8faf9] p-3.5">
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#3b9c72]" /><span className="text-[11px] font-semibold text-[#40645a]">Demo environment</span></div>
          <p className="mt-2 text-[11px] leading-4 text-[#85918c]">Connected to a local PostgreSQL-style dataset.</p>
        </div>
        <div className="mt-5 px-3 text-[10px] leading-4 text-[#a0a7ad]">Unofficial portfolio project demonstrating AI-agent and full-stack engineering.</div>
      </aside>
      {mobileOpen && <button className="fixed inset-0 z-20 bg-[#16211f]/20 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" />}
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-10 flex h-[68px] items-center justify-between border-b border-[#e5e8ec] bg-white/90 px-5 backdrop-blur lg:px-9">
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-[#e4e8eb] text-[#66727c] lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={18} /></button>
          <div className="hidden text-[12px] text-[#8c969e] lg:block">Workspace / <span className="text-[#46515b]">{pathname === "/" ? "Overview" : pathname.slice(1).replace("-", " ")}</span></div>
          <div className="ml-auto flex items-center gap-3"><span className="hidden text-[11px] text-[#8b969f] sm:inline">Demo workspace</span><div className="grid h-8 w-8 place-items-center rounded-full bg-[#e4eee9] text-[11px] font-semibold text-[#276655]">AS</div></div>
        </header>
        <main className="mx-auto max-w-[1480px] px-5 py-7 lg:px-9 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
