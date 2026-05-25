"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { CanvasTexture, DoubleSide, Group, Mesh } from "three";

const BLUE_PRIMARY = "#2A6BFF";
const BLUE_GLOW = "#5BA8FF";
const BLUE_CYAN = "#6FD0FF";
const LIME = "#C9F26C";

type CardData = {
  purpose: string;
  amount: string;
  apr: string;
  score: number;
  funded: number;
  spark: number[];
};

const CARDS: CardData[] = [
  { purpose: "TUITION TOP-UP",   amount: "€500",   apr: "8.0%",  score: 84, funded: 92,  spark: [2, 4, 3, 5, 7, 8, 9, 11] },
  { purpose: "LAPTOP & EQUIP.",  amount: "€1,200", apr: "11.0%", score: 71, funded: 62,  spark: [5, 4, 6, 8, 7, 9, 10, 12] },
  { purpose: "BOOKS",            amount: "€300",   apr: "7.5%",  score: 90, funded: 100, spark: [3, 5, 4, 6, 5, 7, 8, 9] },
  { purpose: "LIVING COSTS",     amount: "€800",   apr: "9.5%",  score: 78, funded: 48,  spark: [4, 3, 5, 4, 6, 7, 6, 8] },
  { purpose: "TRAVEL HOME",      amount: "€2,000", apr: "12.0%", score: 65, funded: 28,  spark: [2, 3, 2, 4, 5, 6, 7, 9] },
  { purpose: "COURSE MATERIALS", amount: "€450",   apr: "8.5%",  score: 82, funded: 76,  spark: [5, 6, 5, 7, 8, 8, 9, 10] },
];

/* Canvas-baked card face — amount, sparkline, score badge, funded bar */
function useCardTexture(card: CardData) {
  return useMemo(() => {
    const w = 512;
    const h = 384;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Glass background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#13192E");
    bg.addColorStop(1, "#05070F");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Inner border
    ctx.strokeStyle = "rgba(111,208,255,0.28)";
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, w - 12, h - 12);

    // Top label
    ctx.fillStyle = "rgba(170,200,235,0.55)";
    ctx.font = "600 18px ui-monospace, 'Geist Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(card.purpose, 28, 50);

    // APR badge top-right
    ctx.fillStyle = LIME;
    ctx.font = "600 18px ui-monospace, 'Geist Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(`↗ ${card.apr}`, w - 28, 50);

    // Amount
    ctx.fillStyle = "#F6F7F4";
    ctx.font = "bold 78px ui-monospace, 'Geist Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(card.amount, 28, 140);

    // Sparkline area
    const startX = 28;
    const endX = w - 28;
    const baseY = 250;
    const topY = 175;
    const max = Math.max(...card.spark);
    const min = Math.min(...card.spark);
    const range = Math.max(1, max - min);
    const step = (endX - startX) / (card.spark.length - 1);

    // Sparkline gradient fill
    const fill = ctx.createLinearGradient(0, topY, 0, baseY);
    fill.addColorStop(0, "rgba(91,168,255,0.45)");
    fill.addColorStop(1, "rgba(91,168,255,0)");
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(startX, baseY);
    card.spark.forEach((v, i) => {
      const x = startX + i * step;
      const y = baseY - ((v - min) / range) * (baseY - topY);
      ctx.lineTo(x, y);
    });
    ctx.lineTo(endX, baseY);
    ctx.closePath();
    ctx.fill();

    // Sparkline stroke
    ctx.strokeStyle = BLUE_GLOW;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    card.spark.forEach((v, i) => {
      const x = startX + i * step;
      const y = baseY - ((v - min) / range) * (baseY - topY);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Funded label + percent
    ctx.fillStyle = "rgba(170,200,235,0.55)";
    ctx.font = "600 14px ui-monospace, 'Geist Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("FUNDED", 28, 292);
    ctx.fillStyle = "#F6F7F4";
    ctx.textAlign = "right";
    ctx.fillText(`${card.funded}%`, w - 28, 292);

    // Funded progress bar
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(28, 302, w - 56, 4);
    ctx.fillStyle = LIME;
    ctx.fillRect(28, 302, ((w - 56) * card.funded) / 100, 4);

    // Score pill
    ctx.fillStyle = "rgba(201,242,108,0.14)";
    roundRect(ctx, 28, 332, 120, 32, 16, true);
    ctx.fillStyle = LIME;
    ctx.font = "600 16px ui-monospace, 'Geist Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`Score ${card.score}`, 88, 354);

    // "Fund →"
    ctx.fillStyle = LIME;
    ctx.font = "600 16px ui-monospace, 'Geist Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText("Fund →", w - 28, 354);

    const tex = new CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [card]);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: boolean,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
}

/* Single floating glass loan card */
function LoanCard({
  card,
  position,
  rotationY,
  phase,
  highlight = false,
}: Readonly<{
  card: CardData;
  position: [number, number, number];
  rotationY: number;
  phase: number;
  highlight?: boolean;
}>) {
  const ref = useRef<Group>(null!);
  const tex = useCardTexture(card);

  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime + phase;
    ref.current.position.y = position[1] + Math.sin(t * 0.9) * 0.08;
    ref.current.rotation.y = rotationY + Math.sin(t * 0.5) * 0.04;
  });

  const W = 1.6;
  const H = 1.2;
  const D = 0.06;

  return (
    <Float speed={1.0} rotationIntensity={0.05} floatIntensity={0.25}>
      <group ref={ref} position={position} rotation={[0, rotationY, 0]}>
        {/* Card body (thin slab) */}
        <mesh castShadow>
          <boxGeometry args={[W, H, D]} />
          <meshStandardMaterial
            color={"#0B1124"}
            metalness={0.55}
            roughness={0.35}
            emissive={highlight ? "#1B3D8C" : "#0C2A78"}
            emissiveIntensity={highlight ? 0.45 : 0.25}
          />
        </mesh>

        {/* Front face — baked card UI */}
        <mesh position={[0, 0, D / 2 + 0.001]}>
          <planeGeometry args={[W * 0.97, H * 0.97]} />
          <meshStandardMaterial
            map={tex ?? undefined}
            roughness={0.4}
            metalness={0.3}
            emissive={"#0C1A40"}
            emissiveIntensity={highlight ? 0.6 : 0.4}
            transparent
          />
        </mesh>

        {/* Subtle rim glow (back-side plane) */}
        <mesh position={[0, 0, -D / 2 - 0.002]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[W * 1.02, H * 1.02]} />
          <meshBasicMaterial
            color={highlight ? BLUE_CYAN : BLUE_GLOW}
            transparent
            opacity={highlight ? 0.18 : 0.08}
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* Carousel-style ring of loan cards */
function LoanCarousel() {
  const groupRef = useRef<Group>(null!);

  useFrame((s, dt) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += dt * 0.12;
  });

  const radius = 3.2;
  const count = CARDS.length;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {CARDS.map((card, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const y = Math.sin(angle * 2) * 0.25;
        // Each card faces outward from the ring center
        const rotY = angle + Math.PI;
        return (
          <LoanCard
            key={card.purpose}
            card={card}
            position={[x, y, z]}
            rotationY={rotY}
            phase={i * 0.7}
            highlight={i === 0}
          />
        );
      })}
    </group>
  );
}

/* Glowing "market floor" disk underneath */
function MarketFloor() {
  const ref = useRef<Mesh>(null!);
  useFrame((s, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.06;
  });
  return (
    <mesh ref={ref} position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[2.4, 4.4, 96, 1]} />
      <meshBasicMaterial
        color={BLUE_PRIMARY}
        transparent
        opacity={0.18}
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.35} color={"#0c1638"} />
      <directionalLight position={[-5, 4, 5]} intensity={1.2} color={BLUE_GLOW} />
      <directionalLight position={[5, 2, 3]} intensity={0.9} color={BLUE_CYAN} />
      <pointLight position={[0, 0, -4]} intensity={2.0} color={BLUE_PRIMARY} distance={12} />
      <pointLight position={[0, -2, 2]} intensity={1.4} color={"#C9F26C"} distance={6} decay={2} />

      <LoanCarousel />
      <MarketFloor />

      <Sparkles count={70} scale={[10, 5, 5]} size={1.8} speed={0.25} color={BLUE_CYAN} opacity={0.55} />
    </>
  );
}

export function MarketsScene() {
  const dpr = useMemo<[number, number]>(() => [1, 1.8], []);
  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0.6, 6.4], fov: 44 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <Scene />
    </Canvas>
  );
}
