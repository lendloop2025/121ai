/**
 * Decorative "intelligence" centerpiece for the admin command deck.
 *
 * A glowing radial relationship web: a golden sun-like core emitting bloom,
 * two concentric rings of nodes joined by neon magenta / orange / blue edges,
 * traveling data pulses, and floating data labels seeded from live platform
 * metrics. Pure SVG + CSS animation (defined in globals.css) so it renders on
 * the server with no client JS.
 */

const CX = 400;
const CY = 300;

type LabeledNode = { label: string; value: string };

// Neon edge palette, cycled around the rings.
const EDGE_COLORS = [
  "var(--adm-magenta)",
  "var(--adm-orange)",
  "var(--cb-blue)",
  "var(--adm-amber)",
  "var(--cb-sky)",
];

function ring(count: number, radiusX: number, radiusY: number, phase = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = phase + (i / count) * Math.PI * 2;
    return {
      i,
      x: CX + Math.cos(a) * radiusX,
      y: CY + Math.sin(a) * radiusY,
      angle: a,
    };
  });
}

export function NetworkGraph({ nodes, className = "" }: { nodes: LabeledNode[]; className?: string }) {
  const inner = ring(6, 150, 120, -Math.PI / 2);
  const outer = ring(12, 320, 240, -Math.PI / 2 + 0.26);

  // Which outer nodes get a floating data label (spread around the perimeter).
  const labelSlots = [0, 2, 4, 6, 8, 10];

  // A handful of outer↔outer chords for the dense "web" feel.
  const chords: [number, number][] = [
    [0, 5],
    [2, 8],
    [3, 10],
    [6, 11],
    [1, 7],
    [4, 9],
  ];

  return (
    <div className={`adm-graph-wrap ${className}`} aria-hidden>
      <svg
        viewBox="0 0 800 600"
        className="w-full h-full block"
      >
        <defs>
          {/* Golden core bloom */}
          <radialGradient id="adm-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF6DE" />
            <stop offset="35%" stopColor="var(--adm-sun)" />
            <stop offset="70%" stopColor="var(--adm-orange)" />
            <stop offset="100%" stopColor="rgba(255,122,42,0)" />
          </radialGradient>
          <radialGradient id="adm-core-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,200,120,0.55)" />
            <stop offset="55%" stopColor="rgba(255,122,42,0.18)" />
            <stop offset="100%" stopColor="rgba(255,122,42,0)" />
          </radialGradient>
          <filter id="adm-blur-lg" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <filter id="adm-blur-sm" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Bloom halo behind everything */}
        <circle cx={CX} cy={CY} r={170} fill="url(#adm-core-halo)" filter="url(#adm-blur-lg)" />

        {/* Rotating relationship web */}
        <g className="adm-orbit-slow" style={{ transformOrigin: `${CX}px ${CY}px` }}>
          {/* Concentric guide rings */}
          <ellipse cx={CX} cy={CY} rx={150} ry={120} fill="none" stroke="var(--adm-border)" strokeWidth={1} />
          <ellipse cx={CX} cy={CY} rx={320} ry={240} fill="none" stroke="var(--adm-border)" strokeWidth={1} />

          {/* Core → inner edges */}
          {inner.map((n, i) => (
            <g key={`ci-${i}`}>
              <line
                x1={CX} y1={CY} x2={n.x} y2={n.y}
                stroke={EDGE_COLORS[i % EDGE_COLORS.length]}
                strokeWidth={1}
                opacity={0.35}
              />
              <line
                x1={CX} y1={CY} x2={n.x} y2={n.y}
                stroke={EDGE_COLORS[i % EDGE_COLORS.length]}
                strokeWidth={1.5}
                className="adm-edge-pulse"
                style={{ animationDelay: `${i * 0.4}s` }}
              />
            </g>
          ))}

          {/* Inner → outer edges (each inner node fans to two outer nodes) */}
          {outer.map((n, i) => {
            const src = inner[i % inner.length];
            const color = EDGE_COLORS[i % EDGE_COLORS.length];
            return (
              <g key={`io-${i}`}>
                <line
                  x1={src.x} y1={src.y} x2={n.x} y2={n.y}
                  stroke={color} strokeWidth={1} opacity={0.28}
                />
                <line
                  x1={src.x} y1={src.y} x2={n.x} y2={n.y}
                  stroke={color} strokeWidth={1.25}
                  className="adm-edge-pulse"
                  style={{ animationDelay: `${i * 0.25}s` }}
                />
              </g>
            );
          })}

          {/* Outer ↔ outer chords */}
          {chords.map(([a, b], i) => (
            <line
              key={`ch-${i}`}
              x1={outer[a].x} y1={outer[a].y} x2={outer[b].x} y2={outer[b].y}
              stroke="var(--adm-magenta)" strokeWidth={1} opacity={0.16}
            />
          ))}

          {/* Inner nodes */}
          {inner.map((n, i) => (
            <g key={`ni-${i}`}>
              <circle cx={n.x} cy={n.y} r={5} fill="var(--adm-amber)" filter="url(#adm-blur-sm)" />
              <circle cx={n.x} cy={n.y} r={2.6} fill="#FFF6DE" />
            </g>
          ))}

          {/* Outer nodes + ping rings */}
          {outer.map((n, i) => {
            const color = EDGE_COLORS[i % EDGE_COLORS.length];
            return (
              <g key={`no-${i}`}>
                <circle
                  cx={n.x} cy={n.y} r={3}
                  fill="none" stroke={color} strokeWidth={1.4}
                  className="adm-node-ping"
                  style={{ animationDelay: `${(i % 6) * 0.55}s` }}
                />
                <circle cx={n.x} cy={n.y} r={3} fill={color} filter="url(#adm-blur-sm)" />
                <circle cx={n.x} cy={n.y} r={2} fill="#EAF2FF" />
              </g>
            );
          })}
        </g>

        {/* Golden sun-like core (not rotated, sits dead center) */}
        <circle cx={CX} cy={CY} r={60} fill="url(#adm-core)" className="adm-core-glow" />
        <circle cx={CX} cy={CY} r={26} fill="url(#adm-core)" />
        <circle cx={CX} cy={CY} r={11} fill="#FFFBEF" />

        {/* Drifting motes */}
        {[...Array(7)].map((_, i) => {
          const a = (i / 7) * Math.PI * 2;
          const r = 120 + (i % 3) * 70;
          return (
            <circle
              key={`m-${i}`}
              cx={CX + Math.cos(a) * r}
              cy={CY + Math.sin(a) * r * 0.78}
              r={1.5}
              fill="var(--adm-amber)"
              className="adm-mote"
              style={{ animationDelay: `${i * 0.7}s` }}
            />
          );
        })}

        {/* Floating data labels — drawn inside the SVG so they always track
            their outer node, whatever size the graph is scaled to. */}
        {nodes.slice(0, labelSlots.length).map((node, i) => {
          const n = outer[labelSlots[i]];
          const onRight = n.x >= CX;
          const lx = n.x + (onRight ? 14 : -14);
          const anchor = onRight ? "start" : "end";
          return (
            <g key={node.label}>
              <line x1={n.x} y1={n.y} x2={lx} y2={n.y} stroke="var(--adm-border)" strokeWidth={1} />
              <text x={lx} y={n.y - 4} textAnchor={anchor} fill="var(--adm-text-subtle)"
                    className="adm-mono" fontSize={9} letterSpacing="1.5">
                {node.label.toUpperCase()}
              </text>
              <text x={lx} y={n.y + 10} textAnchor={anchor} fill="var(--adm-text)"
                    className="adm-mono" fontSize={14} fontWeight={600}>
                {node.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
