// Deterministic "generated cover" for a track card.
//
// v2 — the first version used fully independent hsla() blobs, which
// looked like a random rainbow sticker unrelated to the rest of the site.
// This version reuses the exact visual language already used everywhere
// else on the site for ambient glows (About/Contact backdrops,
// FloatingBlob, ToolsEllipse): `radial-gradient(circle, var(--accent) ...,
// transparent ...)`. Using `var(--accent)` instead of a fixed hex means
// the cover automatically follows the site's light/dark theme toggle
// (red in light mode, orange in dark mode) instead of staying a fixed
// color regardless of theme.
//
// A small deterministic hue-rotate is layered on top purely for per-track
// variety. It's applied to the whole background layer, but since the dark
// base gradient is near-black/desaturated, hue-rotate barely touches it —
// only the saturated accent glows visibly shift hue — so cards still read
// as "the site's accent glow, just a different track" rather than an
// unrelated color.

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) || 1;
}

function glow(h: number, i: number): string {
  const x = 15 + ((h >> (i * 4 + 1)) % 70);
  const y = 10 + ((h >> (i * 4 + 3)) % 75);
  const size = 42 + ((h >> (i * 2)) % 26);
  const strength = Math.round((0.42 - i * 0.09) * 100);
  return `radial-gradient(circle at ${x}% ${y}%, color-mix(in srgb, var(--accent) ${strength}%, transparent) 0%, transparent ${size}%)`;
}

export type GenerativeCoverStyle = {
  backgroundImage: string;
  filter: string;
};

/**
 * Ready-to-spread style for a dedicated background *layer* — deliberately
 * NOT meant to be applied to a card that also contains text/icons/bars,
 * since the hue-rotate filter would then affect those too. Render it as
 * its own `absolute inset-0` element, with the rest of the card's content
 * as siblings on top of it.
 */
export function generativeCoverStyle(seed: string): GenerativeCoverStyle {
  const h = hashSeed(seed);
  const glows = [glow(h, 0), glow(h, 1), glow(h, 2)].join(", ");
  return {
    backgroundImage: `${glows}, linear-gradient(160deg, #211e1a 0%, #131110 100%)`,
    filter: `hue-rotate(${h % 360}deg)`,
  };
}

/** Small positive integer derived from a seed — handy for staggering per-card animation timing. */
export function seedToInt(seed: string): number {
  return hashSeed(seed);
}
