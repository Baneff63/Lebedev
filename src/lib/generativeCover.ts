// Deterministically turns a seed string (a track id) into a small abstract
// "generated cover" — a few soft colored blobs over a dark base, in the
// spirit of Spotify/Apple Music auto-generated playlist art. Same seed
// always produces the same art, so a track's card looks identical
// everywhere it appears (portfolio grid, marquee, and every duplicated
// marquee clone of that same track) without ever storing a real image.

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) || 1;
}

function blob(h: number, i: number): string {
  // Spread each blob's numbers out using different multipliers/shifts of
  // the same hash so three blobs from one seed don't end up looking
  // suspiciously similar to each other.
  const hue = (h * (i * 37 + 11)) % 360;
  const x = 12 + ((h >> (i * 3 + 1)) % 76);
  const y = 8 + ((h >> (i * 5 + 2)) % 82);
  const sat = 55 + ((i * 9) % 25);
  const light = 40 + ((i * 13) % 20);
  const alpha = (0.5 - i * 0.09).toFixed(2);
  const size = 55 + ((i * 17) % 25);
  return `radial-gradient(circle at ${x}% ${y}%, hsla(${hue}, ${sat}%, ${light}%, ${alpha}) 0%, transparent ${size}%)`;
}

/** CSS `background-image` value: 3 seeded blobs over the site's existing dark card base. */
export function generativeCoverBackground(seed: string): string {
  const h = hashSeed(seed);
  const blobs = [blob(h, 0), blob(h, 1), blob(h, 2)].join(", ");
  return `${blobs}, linear-gradient(160deg, #211e1a 0%, #131110 100%)`;
}

/** Ready-to-spread inline style object for a card's cover element. */
export function generativeCoverStyle(seed: string): { backgroundImage: string } {
  return { backgroundImage: generativeCoverBackground(seed) };
}

/** Small positive integer derived from a seed — handy for staggering per-card animation timing. */
export function seedToInt(seed: string): number {
  return hashSeed(seed);
}
