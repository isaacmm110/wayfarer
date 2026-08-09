"use client";

import { motion } from "framer-motion";

import { Globe } from "@/components/globe/Globe";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div className="absolute inset-x-[-30%] bottom-[-18%] top-[14%] sm:inset-x-[-18%] sm:bottom-[-35%] sm:top-[8%] lg:inset-x-[-12%] lg:bottom-[-48%] lg:top-[4%]">
        <Globe />
      </div>

      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="pointer-events-none relative z-20 mx-auto flex max-w-3xl flex-col items-center px-6 pt-16 text-center [text-shadow:0_2px_24px_var(--background)] sm:pt-20 lg:pt-24"
      >
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-text-primary sm:text-5xl lg:text-6xl">
          {SITE_NAME}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary sm:mt-4 sm:text-lg sm:leading-7">
          {SITE_TAGLINE}
        </p>
      </motion.header>
    </main>
  );
}
