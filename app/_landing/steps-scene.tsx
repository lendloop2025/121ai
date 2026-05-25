"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { BackSide, CanvasTexture, DoubleSide, Group, Mesh } from "three";

const BLUE_PRIMARY = "#2A6BFF";
const BLUE_GLOW = "#5BA8FF";
const BLUE_CYAN = "#6FD0FF";

/* Number face baked onto each orb's equator strip */
function useStepFaceTexture(label: string, active: boolean) {
  return useMemo(() => {
    const w = 512;
    const h = 256;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Deep base
    const base = ctx.createRadialGradient(w / 2, h / 2, 30, w / 2, h / 2, w / 2);
    base.addColorStop(0, active ? "#1B3D8C" : "#0E2050");
    base.addColorStop(0.6, "#06112E");
    base.addColorStop(1, "#02050F");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // Latitude grid
    ctx.strokeStyle = "rgba(111,208,255,0.18)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const y = (h / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let i = 0; i < 20; i++) {
      const x = (w / 20) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Sparkle nodes
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.fillStyle = `rgba(180,220,255,${0.4 + Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, 1 + Math.random() * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Repeating number band across the equator so it always faces camera
    ctx.fillStyle = active ? "#EAF4FF" : "#9CC6FF";
    ctx.font = `bold ${active ? 150 : 130}px "Geist Mono", ui-monospace, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = BLUE_GLOW;
    ctx.shadowBlur = active ? 36 : 18;
    [w * 0.25, w * 0.75].forEach((cx) => {
      ctx.fillText(label, cx, h / 2);
    });

    const tex = new CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [label, active]);
}

function Orb({
  position,
  label,
  active = false,
  spin = 0.5,
  phase = 0,
}: Readonly<{
  position: [number, number, number];
  label: string;
  active?: boolean;
  spin?: number;
  phase?: number;
}>) {
  const earth = useRef<Mesh>(null!);
  const wire = useRef<Mesh>(null!);
  const halo = useRef<Group>(null!);
  const tex = useStepFaceTexture(label, active);

  useFrame((s, dt) => {
    if (earth.current) earth.current.rotation.y += dt * spin;
    if (wire.current) {
      wire.current.rotation.y -= dt * spin * 0.4;
      wire.current.rotation.x += dt * 0.04;
    }
    if (halo.current) {
      const t = s.clock.elapsedTime + phase;
      halo.current.rotation.z = t * 0.25;
    }
  });

  const r = active ? 1.1 : 0.78;

  return (
    <Float speed={1.1} rotationIntensity={0.0} floatIntensity={active ? 0.45 : 0.3}>
      <group position={position}>
        {/* Solid orb body */}
        <mesh ref={earth} castShadow>
          <sphereGeometry args={[r, 80, 80]} />
          <meshStandardMaterial
            map={tex ?? undefined}
            roughness={0.45}
            metalness={0.4}
            emissive={"#0C2A78"}
            emissiveIntensity={active ? 0.55 : 0.35}
          />
        </mesh>

        {/* Wireframe overlay */}
        <mesh ref={wire}>
          <sphereGeometry args={[r * 1.022, 28, 20]} />
          <meshBasicMaterial
            color={BLUE_CYAN}
            wireframe
            transparent
            opacity={active ? 0.22 : 0.14}
            toneMapped={false}
          />
        </mesh>

        {/* Atmosphere glow */}
        <mesh scale={1.22}>
          <sphereGeometry args={[r, 48, 48]} />
          <meshBasicMaterial
            color={BLUE_GLOW}
            transparent
            opacity={active ? 0.18 : 0.1}
            side={BackSide}
            toneMapped={false}
          />
        </mesh>

        {/* Rotating halo ring */}
        <group ref={halo}>
          <mesh rotation={[Math.PI / 2.2, 0, 0]}>
            <torusGeometry args={[r * 1.45, 0.008, 16, 160]} />
            <meshBasicMaterial
              color={BLUE_CYAN}
              transparent
              opacity={active ? 0.5 : 0.28}
              side={DoubleSide}
              toneMapped={false}
            />
          </mesh>
          {active && (
            <mesh rotation={[Math.PI / 2 + 0.6, 0, 0]}>
              <torusGeometry args={[r * 1.7, 0.005, 16, 160]} />
              <meshBasicMaterial
                color={BLUE_GLOW}
                transparent
                opacity={0.35}
                side={DoubleSide}
                toneMapped={false}
              />
            </mesh>
          )}
        </group>

        {/* Inner core point light */}
        <pointLight color={BLUE_PRIMARY} intensity={active ? 3.5 : 2.2} distance={4} decay={1.8} />
      </group>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.35} color={"#0c1638"} />
      <directionalLight position={[-4, 4, 4]} intensity={1.2} color={BLUE_GLOW} />
      <directionalLight position={[5, 2, 2]} intensity={0.8} color={BLUE_CYAN} />
      <pointLight position={[0, 0, -4]} intensity={1.5} color={BLUE_PRIMARY} distance={10} />

      <Orb position={[-3.4, 0, 0]} label="01" spin={0.45} phase={0} />
      <Orb position={[0, 0, 0.6]} label="02" active spin={0.55} phase={1.3} />
      <Orb position={[3.4, 0, 0]} label="03" spin={0.4} phase={2.6} />

      <Sparkles count={60} scale={[10, 4, 4]} size={1.8} speed={0.25} color={BLUE_CYAN} opacity={0.55} />
    </>
  );
}

export function StepsScene() {
  const dpr = useMemo<[number, number]>(() => [1, 1.8], []);
  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0.1, 6.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <Scene />
    </Canvas>
  );
}
