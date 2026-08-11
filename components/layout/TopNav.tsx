"use client";

import { Compass, Search, X } from "lucide-react";
import { useState } from "react";

import { NAV_MOCK } from "@/lib/mock-stats";
import { SITE_NAME } from "@/lib/site";

function SearchField({ className = "" }: { className?: string }) {
  return (
    <label className={`glass flex h-10 items-center gap-2 rounded-full px-3 shadow-none transition-shadow duration-200 focus-within:shadow-glow-cyan ${className}`.trim()}>
      <Search className="size-4 shrink-0 text-text-secondary" aria-hidden="true" />
      <span className="sr-only">Search destinations</span>
      <input
        type="search"
        autoComplete="off"
        placeholder={NAV_MOCK.searchPlaceholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
      />
    </label>
  );
}

export function TopNav() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <nav
        aria-label="Primary navigation"
        className="pointer-events-auto mx-auto flex h-14 w-full min-w-0 max-w-[1600px] items-center gap-1.5 rounded-2xl border border-border px-2 shadow-card backdrop-blur-xl [background:color-mix(in_srgb,var(--surface)_35%,transparent)] sm:gap-3 sm:px-4"
      >
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <span className="grid size-7 place-items-center rounded-lg border border-border text-accent-cyan shadow-glow-cyan sm:size-8">
            <Compass className="size-4" aria-hidden="true" />
          </span>
          <span className="text-xs font-semibold tracking-[-0.02em] text-text-primary sm:text-sm">{SITE_NAME}</span>
        </div>

        <div className="hidden items-center gap-2 text-xs font-medium text-text-secondary lg:flex">
          {NAV_MOCK.breadcrumbs.map((crumb, index) => (
            <span key={crumb} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              <span className={index === NAV_MOCK.breadcrumbs.length - 1 ? "text-text-primary" : ""}>{crumb}</span>
            </span>
          ))}
        </div>

        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-3">
          <SearchField className="hidden w-[min(34vw,360px)] sm:flex" />
          <button
            type="button"
            aria-label={isSearchOpen ? "Close search" : "Open search"}
            aria-expanded={isSearchOpen}
            onClick={() => setIsSearchOpen((open) => !open)}
            className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-text-secondary transition hover:text-text-primary sm:hidden"
          >
            {isSearchOpen ? <X className="size-4" /> : <Search className="size-4" />}
          </button>

          <div className="flex shrink-0 items-center gap-2 rounded-full px-1 py-1.5 sm:border sm:border-border sm:px-2.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-red opacity-30" />
              <span className="relative inline-flex size-2 rounded-full bg-accent-red" />
            </span>
            <span className="hidden text-xs font-semibold text-accent-red sm:inline">
              {NAV_MOCK.liveLabel}
            </span>
          </div>
          <button
            type="button"
            aria-label="Open profile"
            className="size-8 shrink-0 rounded-full border border-border bg-[linear-gradient(135deg,var(--accent-blue),var(--accent-cyan))] shadow-glow-blue sm:size-9"
          />
        </div>
      </nav>

      {isSearchOpen ? (
        <SearchField className="pointer-events-auto mx-auto mt-2 flex max-w-[1600px] sm:hidden" />
      ) : null}
    </header>
  );
}
