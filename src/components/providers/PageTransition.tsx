"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Wraps every public page so navigating between routes does something more
 * interesting than a flat cross-fade: an iris (`clip-path: circle()`)
 * reveal, echoing the loading screen's exit animation, plus a thin
 * accent-colored scanline that sweeps down once on top of it.
 *
 * The main wrapper below only ever animates `opacity`/`clipPath` — never
 * `transform` — on purpose. Framer Motion leaves a lingering inline
 * `transform` style on an element after animating `x`/`y`/`scale`, even
 * once the animation finishes, and a stray `transform` on an ancestor
 * makes it the *containing block* for any `position: fixed` descendant.
 * Since this wrapper surrounds the **entire routed page**, that would
 * silently break any real `position: fixed` element inside it — e.g. the
 * contact page's BPM/key-analyzer modal would start positioning itself
 * relative to this wrapper instead of the actual viewport. `clip-path`
 * doesn't have that side effect, so the reveal stays transform-free.
 *
 * The scanline sweep below the wrapper *does* animate `y` (framer-motion's
 * `y` is transform-based) — that's fine specifically because it's a
 * plain sibling of the wrapper, not something `children` renders inside
 * of, so its own transform can't affect anything the routed page does.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={pathname} className="relative">
        <motion.div
          initial={{ opacity: 0, clipPath: "circle(2% at 50% 0%)" }}
          animate={{ opacity: 1, clipPath: "circle(150% at 50% 0%)" }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.25 },
            clipPath: { duration: 0.7, ease: EASE },
          }}
        >
          {children}
        </motion.div>

        {/* Decorative scanline sweep — a plain sibling, not a wrapper, so
            animating its own `transform` (for smooth GPU motion) can't
            affect anything inside `children`. */}
        <motion.div
          initial={{ y: "0vh", opacity: 0 }}
          animate={{ y: "100vh", opacity: [0, 0.7, 0] }}
          transition={{ duration: 0.7, ease: EASE }}
          className="pointer-events-none fixed inset-x-0 top-0 z-[85] h-[2px]"
          style={{
            background: "var(--accent)",
            boxShadow: "0 0 16px 2px var(--accent)",
          }}
          aria-hidden
        />
      </motion.div>
    </AnimatePresence>
  );
}
