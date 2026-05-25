"use client";

import dynamic from "next/dynamic";

const MarketsScene = dynamic(
  () => import("./markets-scene").then((m) => m.MarketsScene),
  { ssr: false, loading: () => null }
);

export function MarketsSceneLoader() {
  return <MarketsScene />;
}
