"use client";

import dynamic from "next/dynamic";

const HeroScene = dynamic(
  () => import("./hero-scene").then((m) => m.HeroScene),
  { ssr: false, loading: () => null }
);

export function HeroSceneLoader() {
  return <HeroScene />;
}
