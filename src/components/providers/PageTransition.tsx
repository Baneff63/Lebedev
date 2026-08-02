"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Wraps every public page so navigating between routes fades/lifts instead
 * of hard-cutting, which is what made transitions feel abrupt before.
 * `framer-motion` was already a project dependency but wasn't wired up
 * anywhere — this is the only place it's used.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
