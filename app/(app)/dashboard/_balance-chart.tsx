"use client";

import * as React from "react";
import { formatEur } from "@/lib/utils";

export type ChartPoint = { t: string; v: number };

const WINDOWS = [
  { key: "7d", label: "1W", days: 7 },
  { key: "30d", label: "1M", days: 30 },
  { key: "all", label: "All", days: Infinity },
] as const;

const W = 720;
const H = 250;
const PAD = { top: 24, right: 16, bottom: 22, left: 16 };

/** Catmull-Rom → cubic-bezier smoothing for a soft, financial-grade curve. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function BalanceChart({ series }: { series: ChartPoint[] }) {
  const [win, setWin] = React.useState<(typeof WINDOWS)[number]["key"]>("30d");
  const [hover, setHover] = React.useState<number | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);

  const data = React.useMemo(() => {
    const w = WINDOWS.find((x) => x.key === win)!;
    if (w.days === Infinity) return series;
    const cutoff = Date.now() - w.days * 24 * 3600 * 1000;
    const filtered = series.filter((p) => new Date(p.t).getTime() >= cutoff);
    // Always keep at least the last two points so the line never disappears.
    return filtered.length >= 2 ? filtered : series.slice(-Math.min(2, series.length));
  }, [series, win]);

  const layout = React.useMemo(() => {
    if (data.length < 2) return null;
    const values = data.map((d) => d.v);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = Math.max(1, max - min);
    // Pad the vertical range so the line breathes inside the plot.
    const top = max + range * 0.18;
    const bottom = min - range * 0.18;
    const span = Math.max(1, top - bottom);
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const pts = data.map((d, i) => ({
      x: PAD.left + (data.length === 1 ? 0 : (i / (data.length - 1)) * innerW),
      y: PAD.top + (1 - (d.v - bottom) / span) * innerH,
    }));
    return { pts, line: smoothPath(pts) };
  }, [data]);

  const onMove = (e: React.MouseEvent) => {
    if (!svgRef.current || data.length < 2) return;
    const rect = svgRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(ratio * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, idx)));
  };

  const latest = series.length ? series[series.length - 1].v : 0;
  const first = data.length ? data[0].v : 0;
  const delta = latest - first;
  const deltaPct = first !== 0 ? (delta / Math.abs(first)) * 100 : 0;
  const up = delta >= 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="dash-kicker">Portfolio value</div>
          <div className="mt-1.5 flex items-end gap-3">
            <div className="text-2xl sm:text-3xl font-bold tabular tracking-tight text-[var(--cb-text)]">
              {formatEur(latest)}
            </div>
            <div
              className={`mb-1 inline-flex items-center gap-1 text-xs font-semibold tabular ${
                up ? "dash-amt-pos" : "dash-amt-neg"
              }`}
            >
              {up ? "▲" : "▼"} {up ? "+" : ""}
              {deltaPct.toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="dash-tabs" role="tablist" aria-label="Chart range">
          {WINDOWS.map((w) => (
            <button
              key={w.key}
              type="button"
              role="tab"
              aria-selected={win === w.key}
              onClick={() => setWin(w.key)}
              className={`dash-tab ${win === w.key ? "is-active" : ""}`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-4">
        {layout ? (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id="dashArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#5BA8FF" stopOpacity="0.40" />
                <stop offset="55%" stopColor="#2A6BFF" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#2A6BFF" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="dashLine" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#6FD0FF" />
                <stop offset="100%" stopColor="#2A6BFF" />
              </linearGradient>
              <filter id="dashGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* subtle horizontal grid */}
            {[0.25, 0.5, 0.75].map((g) => (
              <line
                key={g}
                x1={PAD.left}
                x2={W - PAD.right}
                y1={PAD.top + g * (H - PAD.top - PAD.bottom)}
                y2={PAD.top + g * (H - PAD.top - PAD.bottom)}
                stroke="rgba(120,170,255,0.08)"
                strokeWidth="1"
              />
            ))}

            {/* area fill */}
            <path
              d={`${layout.line} L ${layout.pts[layout.pts.length - 1].x} ${H - PAD.bottom} L ${layout.pts[0].x} ${H - PAD.bottom} Z`}
              fill="url(#dashArea)"
            />

            {/* glowing line */}
            <path
              className="dash-chart-line"
              d={layout.line}
              fill="none"
              stroke="url(#dashLine)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#dashGlow)"
            />

            {/* pulsing end point */}
            <circle
              className="dash-chart-point"
              cx={layout.pts[layout.pts.length - 1].x}
              cy={layout.pts[layout.pts.length - 1].y}
              r="3.6"
              fill="#EAF2FF"
              stroke="#6FD0FF"
              strokeWidth="2"
            />

            {/* hover guide + marker */}
            {hover !== null && layout.pts[hover] && (
              <>
                <line
                  x1={layout.pts[hover].x}
                  x2={layout.pts[hover].x}
                  y1={PAD.top}
                  y2={H - PAD.bottom}
                  stroke="rgba(111,208,255,0.45)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
                <circle
                  cx={layout.pts[hover].x}
                  cy={layout.pts[hover].y}
                  r="5"
                  fill="#6FD0FF"
                  filter="url(#dashGlow)"
                />
              </>
            )}
          </svg>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-sm text-[var(--cb-text-subtle)]">
            Not enough activity yet to chart your portfolio.
          </div>
        )}

        {/* floating tooltip — white card with soft shadow */}
        {layout && hover !== null && data[hover] && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(layout.pts[hover].x / W) * 100}%`,
              top: `${(layout.pts[hover].y / H) * 100}%`,
              marginTop: -10,
            }}
          >
            <div className="rounded-xl bg-white px-3 py-2 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)]">
              <div className="text-[10px] font-medium uppercase tracking-wide text-[#8A94A6]">
                {new Date(data[hover].t).toLocaleDateString("en-IE", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="text-sm font-bold tabular text-[#0E1B2C]">
                {formatEur(data[hover].v)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
