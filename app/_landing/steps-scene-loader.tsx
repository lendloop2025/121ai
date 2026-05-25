"use client";

import dynamic from "next/dynamic";

const StepsScene = dynamic(
  () => import("./steps-scene").then((m) => m.StepsScene),
  { ssr: false, loading: () => null }
);

export function StepsSceneLoader() {
  return <StepsScene />;
}
