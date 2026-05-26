import Link from "next/link";

const steps = [
  { path: "/onboarding/personal-details", label: "Personal" },
  { path: "/onboarding/two-factor", label: "Two-factor" },
  { path: "/onboarding/identity", label: "Identity" },
  { path: "/onboarding/assessment", label: "Assessment" },
  { path: "/onboarding/complete", label: "Complete" },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dash-root min-h-screen px-4 py-10 overflow-hidden">
      <div aria-hidden className="dash-orb dash-orb-blue" style={{ width: 520, height: 520, top: -160, right: -120 }} />
      <div aria-hidden className="dash-orb dash-orb-cyan" style={{ width: 440, height: 440, bottom: -180, left: -140 }} />

      <div className="relative z-10 max-w-xl mx-auto">
        <Link href="/" className="cb-display text-2xl font-bold text-[var(--cb-text)] block text-center mb-6">121.ai</Link>
        <div className="dash-card glass-input p-6 sm:p-7">
          <ol className="flex justify-between text-xs text-[var(--cb-text-subtle)] mb-6">
            {steps.map((s, i) => (
              <li key={s.path}>{i + 1}. {s.label}</li>
            ))}
          </ol>
          {children}
        </div>
      </div>
    </div>
  );
}
