"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { DashboardOverlay } from "@/components/dashboard/DashboardOverlay";
import { Globe } from "@/components/globe/Globe";
import { TopNav } from "@/components/layout/TopNav";
import type { Destination } from "@/lib/mock-destinations";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export default function Home() {
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);

  return (
    <main className="relative min-h-dvh overflow-x-clip">
      <TopNav />

      <section className="relative min-h-dvh overflow-hidden">
        <div className="absolute inset-x-[-2%] bottom-[5%] top-[25%] sm:inset-x-[-6%] sm:bottom-[-15%] sm:top-[17%] lg:inset-x-[-8%] lg:bottom-[-31%] lg:top-[10%]">
          <Globe
            selectedDestination={selectedDestination}
            onDestinationSelect={setSelectedDestination}
          />
        </div>

        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{
            opacity: selectedDestination ? 0 : 1,
            y: selectedDestination ? -8 : 0,
          }}
          transition={{
            duration: selectedDestination ? 0.36 : 0.6,
            ease: "easeOut",
          }}
          aria-hidden={Boolean(selectedDestination)}
          className="pointer-events-none relative z-20 mx-auto flex max-w-3xl flex-col items-center px-6 pt-28 text-center [text-shadow:0_2px_24px_var(--background)] sm:pt-32"
        >
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-text-primary sm:text-5xl lg:text-6xl">
            {SITE_NAME}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary sm:mt-4 sm:text-lg sm:leading-7">
            {SITE_TAGLINE}
          </p>
        </motion.header>

        <AnimatePresence>
          {selectedDestination ? (
            <motion.button
              key="back-to-globe"
              type="button"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              onClick={() => setSelectedDestination(null)}
              className="glass absolute left-4 top-24 z-40 flex h-10 items-center gap-2 rounded-full px-3.5 text-xs font-semibold text-text-primary shadow-glow-cyan transition-colors hover:text-accent-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan lg:left-80"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to globe
            </motion.button>
          ) : null}
        </AnimatePresence>
      </section>

      {selectedDestination ? <DashboardOverlay /> : null}
    </main>
  );
}
