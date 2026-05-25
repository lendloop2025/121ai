"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Sparkles } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import {
  BackSide,
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  Mesh,
  PointLight,
} from "three";

const BLUE_PRIMARY = "#2A6BFF";
const BLUE_DEEP = "#0A1E55";
const BLUE_GLOW = "#5BA8FF";
const BLUE_CYAN = "#6FD0FF";
const GOLD = "#F5C95B";
const GOLD_DEEP = "#B8862F";
const BG_DEEP = "#02050F";

/* =========================================================
   Earth-like texture generated on the fly so we don't need
   any external image assets. Continent blobs + grid lines
   make it read as a globe.
   ========================================================= */
function useEarthTexture() {
  return useMemo(() => {
    const w = 1024;
    const h = 512;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Deep ocean gradient
    const ocean = ctx.createLinearGradient(0, 0, 0, h);
    ocean.addColorStop(0, "#031237");
    ocean.addColorStop(0.5, "#062461");
    ocean.addColorStop(1, "#031237");
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, w, h);

    // Continent-like blobs
    const blobs: [number, number, number][] = [
      [180, 180, 90],
      [220, 200, 60],
      [260, 230, 55],
      [430, 160, 85],
      [470, 200, 60],
      [520, 270, 70],
      [620, 220, 50],
      [690, 250, 95],
      [780, 220, 70],
      [870, 280, 60],
      [120, 350, 70],
      [320, 360, 50],
      [560, 380, 55],
      [820, 380, 65],
    ];
    blobs.forEach(([x, y, r]) => {
      const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
      g.addColorStop(0, "#1F62E6");
      g.addColorStop(0.6, "#1747B0");
      g.addColorStop(1, "rgba(7,22,71,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Latitude grid
    ctx.strokeStyle = "rgba(110,176,255,0.25)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const y = (h / 12) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let i = 0; i < 24; i++) {
      const x = (w / 24) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Sparkle nodes (cities)
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.fillStyle = "rgba(180,220,255,0.85)";
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

/* ----- Euro coin: thin gold cylinder w/ embossed € face ----- */
function useEuroFaceTexture() {
  return useMemo(() => {
    const s = 256;
    const canvas = document.createElement("canvas");
    canvas.width = s;
    canvas.height = s;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const g = ctx.createRadialGradient(s / 2, s / 2, 20, s / 2, s / 2, s / 2);
    g.addColorStop(0, "#FFE08C");
    g.addColorStop(0.55, "#E2B14B");
    g.addColorStop(1, "#7E5A1A");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s / 2 - 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,238,170,0.85)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s / 2 - 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#3A2200";
    ctx.font = "bold 170px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("€", s / 2, s / 2 + 8);

    const tex = new CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

function EuroCoin({
  radius,
  angle,
  speed,
  yOffset = 0,
  scale = 1,
  tilt = 0.4,
  faceTex,
}: {
  radius: number;
  angle: number;
  speed: number;
  yOffset?: number;
  scale?: number;
  tilt?: number;
  faceTex: CanvasTexture | null;
}) {
  const ref = useRef<Group>(null!);
  useFrame((s) => {
    if (ref.current) {
      const t = s.clock.elapsedTime * speed + angle;
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = yOffset + Math.sin(t * 1.4) * 0.18;
      // Spin coin around its own axis
      ref.current.rotation.y = t * 1.6;
      ref.current.rotation.x = tilt;
    }
  });
  return (
    <group ref={ref} scale={scale}>
      {/* Coin body — thin cylinder */}
      <mesh castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.06, 48]} />
        <meshStandardMaterial
          color={GOLD}
          metalness={0.95}
          roughness={0.25}
          emissive={GOLD_DEEP}
          emissiveIntensity={0.25}
        />
      </mesh>
      {/* Front face */}
      <mesh position={[0, 0.031, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.33, 48]} />
        <meshStandardMaterial
          map={faceTex ?? undefined}
          color={"#FFD66A"}
          metalness={0.85}
          roughness={0.3}
          emissive={GOLD_DEEP}
          emissiveIntensity={0.18}
        />
      </mesh>
      {/* Back face */}
      <mesh position={[0, -0.031, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.33, 48]} />
        <meshStandardMaterial
          map={faceTex ?? undefined}
          color={"#FFD66A"}
          metalness={0.85}
          roughness={0.3}
          emissive={GOLD_DEEP}
          emissiveIntensity={0.18}
        />
      </mesh>
    </group>
  );
}

/* ----- Rotating globe with atmospheric glow ----- */
function Globe() {
  const earth = useRef<Mesh>(null!);
  const wire = useRef<Mesh>(null!);
  const innerLight = useRef<PointLight>(null!);
  const tex = useEarthTexture();

  useFrame((s, dt) => {
    if (earth.current) {
      earth.current.rotation.y += dt * 0.22;
    }
    if (wire.current) {
      wire.current.rotation.y -= dt * 0.08;
      wire.current.rotation.x += dt * 0.02;
    }
    if (innerLight.current) {
      const t = s.clock.elapsedTime;
      innerLight.current.intensity = 5 + Math.sin(t * 1.5) * 1.2;
    }
  });

  return (
    <Float speed={0.6} rotationIntensity={0.0} floatIntensity={0.4}>
      <group position={[0, -0.1, 0]} scale={1.0}>
        {/* Solid globe with earth texture */}
        <mesh ref={earth} castShadow>
          <sphereGeometry args={[1.55, 96, 96]} />
          <meshStandardMaterial
            map={tex ?? undefined}
            color={new Color("#1A4FCC")}
            roughness={0.55}
            metalness={0.35}
            emissive={new Color("#0C2A78")}
            emissiveIntensity={0.45}
          />
        </mesh>

        {/* Wireframe overlay — gives the holographic feel */}
        <mesh ref={wire}>
          <sphereGeometry args={[1.585, 32, 24]} />
          <meshBasicMaterial
            color={BLUE_CYAN}
            wireframe
            transparent
            opacity={0.18}
            toneMapped={false}
          />
        </mesh>

        {/* Atmosphere glow — back-side sphere with additive blue */}
        <mesh scale={1.18}>
          <sphereGeometry args={[1.55, 64, 64]} />
          <meshBasicMaterial
            color={BLUE_GLOW}
            transparent
            opacity={0.12}
            side={BackSide}
            toneMapped={false}
          />
        </mesh>

        {/* Inner core light to push blue through edges */}
        <pointLight ref={innerLight} color={BLUE_PRIMARY} intensity={5} distance={6} decay={1.8} />
      </group>
    </Float>
  );
}

/* ----- Orbit ring drawn as a thin torus ----- */
function OrbitRing({
  radius,
  tilt,
  opacity = 0.18,
}: {
  radius: number;
  tilt: number;
  opacity?: number;
}) {
  return (
    <mesh rotation={[Math.PI / 2 + tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.005, 16, 160]} />
      <meshBasicMaterial color={BLUE_CYAN} transparent opacity={opacity} side={DoubleSide} toneMapped={false} />
    </mesh>
  );
}

/* ----- Euro coins orbiting in two rings ----- */
function EuroSwarm() {
  const faceTex = useEuroFaceTexture();
  const coins = useMemo(
    () => [
      { radius: 2.4, angle: 0,            speed: 0.35, y: 0.2,  scale: 1.0, tilt: 0.35 },
      { radius: 2.4, angle: Math.PI * 0.7,speed: 0.35, y: -0.1, scale: 0.85, tilt: 0.5 },
      { radius: 2.4, angle: Math.PI * 1.3,speed: 0.35, y: 0.05, scale: 0.95, tilt: 0.2 },
      { radius: 3.0, angle: Math.PI * 0.3,speed: -0.22, y: 0.4, scale: 0.7,  tilt: -0.3 },
      { radius: 3.0, angle: Math.PI * 1.0,speed: -0.22, y: -0.3, scale: 0.8, tilt: 0.6 },
      { radius: 3.0, angle: Math.PI * 1.7,speed: -0.22, y: 0.15, scale: 0.65, tilt: 0.15 },
    ],
    []
  );
  return (
    <>
      <OrbitRing radius={2.4} tilt={0.15} opacity={0.22} />
      <OrbitRing radius={3.0} tilt={-0.18} opacity={0.14} />
      {coins.map((c, i) => (
        <EuroCoin
          key={i}
          radius={c.radius}
          angle={c.angle}
          speed={c.speed}
          yOffset={c.y}
          scale={c.scale}
          tilt={c.tilt}
          faceTex={faceTex}
        />
      ))}
    </>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} color={"#0c1638"} />
      {/* Cool blue key light */}
      <directionalLight position={[-4, 5, 4]} intensity={1.4} color={BLUE_GLOW} />
      {/* Cyan rim */}
      <directionalLight position={[6, 3, 2]} intensity={1.0} color={BLUE_CYAN} />
      {/* Warm gold fill from below — catches the coins */}
      <pointLight position={[0, -1.0, 2.5]} intensity={1.2} color={GOLD} distance={9} />
      {/* Back rim to silhouette globe */}
      <pointLight position={[0, 0, -4]} intensity={2.0} color={BLUE_PRIMARY} distance={10} />

      <Globe />
      <EuroSwarm />

      {/* Background sparkle dust */}
      <Sparkles count={80} scale={[10, 6, 6]} size={2} speed={0.25} color={BLUE_CYAN} opacity={0.6} />

      <Suspense fallback={null}>
        <Environment preset="night" background={false} />
      </Suspense>
    </>
  );
}

export function HeroScene() {
  const dpr = useMemo<[number, number]>(() => [1, 1.8], []);
  return (
    <Canvas
      dpr={dpr}
      shadows
      camera={{ position: [0, 0.3, 6.6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <fog attach="fog" args={[BG_DEEP, 6, 14]} />
      <Scene />
    </Canvas>
  );
}
