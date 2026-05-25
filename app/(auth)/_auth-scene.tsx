"use client";

import { useMemo } from "react";

/* ------------------------------------------------------------
   Auth scene — cinematic eclipse orb.

   A single massive glowing orb, centred and symmetrical on pure
   black. Built from stacked, blurred, screen-blended layers so it
   reads as one volumetric light source rather than separate shapes:

     · halo      — enormous diffuse atmosphere bleeding into black
     · ring      — slow-rotating conic corona (blue → cyan → amber
                   → orange-red → lavender) masked to a glowing rim
     · ring-2    — counter-rotating inner sweep for shimmer
     · hot       — a warm orange-red highlight that strengthens and
                   migrates toward the right rim in the later phase
     · flood     — pale-blue light that floods the centre mid-cycle
     · core      — the dark eclipse core that anchors the middle

   A master timeline (auth-orb-cycle) drives the slow swing from a
   dark eclipse → cold luminous bloom → warm right-rim climax → and
   back, so the whole thing breathes on a long hypnotic loop. Every
   layer is a styled element — no canvas, no shaders, no deps.
   ------------------------------------------------------------ */

const CYAN = "#6FD0FF";
const BLUE = "#2A6BFF";
const VIOLET = "#9B7CFF";
const GOLD = "#FFB35B";
const ORANGE = "#FF6A2A";

// Deterministic scatter so SSR + CSR markup matches.
function useScatter(count: number, seed: number) {
  return useMemo(() => {
    let r = seed;
    const rnd = () => {
      r = (r * 9301 + 49297) % 233280;
      return r / 233280;
    };
    return Array.from({ length: count }, () => ({
      x: rnd() * 100,
      y: rnd() * 100,
      s: rnd(),
      d: rnd(),
      c: rnd(),
    }));
  }, [count, seed]);
}

export function AuthScene() {
  const dust = useScatter(26, 17);
  const palette = [CYAN, BLUE, VIOLET, GOLD];

  return (
    <div className="cine-scene">
      <div className="cine-orb">
        {/* Enormous diffuse atmosphere bleeding into the black */}
        <span aria-hidden className="cine-halo" />

        {/* Pale-blue flood that washes the centre in the middle phase */}
        <span aria-hidden className="cine-flood" />

        {/* Main rotating corona rim */}
        <span aria-hidden className="cine-ring" />

        {/* Counter-rotating shimmer rim */}
        <span aria-hidden className="cine-ring cine-ring-2" />

        {/* Migrating warm hotspot — climbs the right rim later */}
        <span aria-hidden className="cine-hot" />

        {/* Dark eclipse core */}
        <span aria-hidden className="cine-core" />
      </div>

      {/* Faint drifting motes for atmospheric depth */}
      <div className="cine-dust" aria-hidden>
        {dust.map((p, i) => {
          const color = palette[Math.floor(p.c * palette.length)];
          const size = 1 + p.s * 2.2;
          return (
            <span
              key={`d-${i}`}
              className="cine-mote"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: size,
                height: size,
                background: color,
                boxShadow: `0 0 ${size * 3}px ${color}`,
                animationDelay: `${-(p.d * 9).toFixed(2)}s`,
                animationDuration: `${(6 + p.s * 5).toFixed(2)}s`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
