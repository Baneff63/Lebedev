import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ROOT CAUSE FIX: `gsap.registerPlugin(ScrollTrigger)` was never called
// anywhere in this project. Every existing component that used
// `ScrollTrigger` (About.tsx, Contact.tsx, the old Portfolio.tsx/Hero.tsx,
// StatCounter.tsx) is actually dead code — none of them are mounted from
// src/app/page.tsx — so the missing registration never surfaced as a
// runtime error before. `ScrollProgress` in GlobalEffects.tsx was the
// same story: defined, exported, never rendered.
//
// The home-scroll patch is the first thing that actually renders any of
// this (`<ScrollProgress />` + `StatCounter` via `HomeStats.tsx`), which
// is what exposed `ScrollTrigger.create is not a function` at runtime.
//
// Fix: register the plugin exactly once, at this module's first
// evaluation, and have every consumer import `ScrollTrigger` from HERE
// instead of directly from `gsap/ScrollTrigger`. ES module imports are
// cached and side effects only run once, so no matter which consumer
// happens to import first, registration always happens before any of
// them can call `ScrollTrigger.create()` / pass a `scrollTrigger` config.
gsap.registerPlugin(ScrollTrigger);

export { ScrollTrigger };
