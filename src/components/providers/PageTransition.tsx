"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Wraps every public page so navigating between routes cross-fades instead
 * of hard-cutting, which is what made transitions feel abrupt before.
 * `framer-motion` was already a project dependency but wasn't wired up
 * anywhere — this is the only place it's used.
 *
 * Intentionally opacity-only (no `y`/scale/etc): animating `transform` here
 * leaves a lingering inline `transform` style on this wrapper even after
 * the animation finishes (framer-motion doesn't reset it to `none`). A
 * `transform` on an ancestor makes it the *containing block* for any
 * `position: fixed` descendant — which would silently break things like
 * the BPM/key-analyzer modal on the contact page (it would start
 * positioning itself relative to this wrapper's scrollable content box
 * instead of the actual viewport). Fading only opacity avoids that
 * category of bug entirely while still smoothing the transition.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
