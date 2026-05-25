"use client";
import { Suspense, useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { ArrowDownToLine, ArrowRight, Info, ShieldCheck, XCircle } from "lucide-react";
import { createDepositSessionAction } from "@/app/actions/wallet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QUICK_AMOUNTS = [25, 50, 100, 250, 500];

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="lg" fullWidth disabled={pending}>
      {pending ? (
        "Redirecting to Stripe…"
      ) : (
        <>
          Continue to payment
          <ArrowRight className="size-4" />
        </>
      )}
    </Button>
  );
}

export default function DepositPage() {
  return (
    <Suspense>
      <DepositForm />
    </Suspense>
  );
}

function DepositForm() {
  const [state, action] = useActionState(createDepositSessionAction, { url: "", error: "" } as any);
  const [amount, setAmount] = useState<number>(100);
  const params = useSearchParams();
  const cancelled = params.get("cancelled") === "1";

  useEffect(() => {
    if (state?.url) window.location.href = state.url;
  }, [state]);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <header className="space-y-2">
        <div className="inline-flex items-center justify-center size-11 rounded-[var(--radius-md)] bg-[var(--brand-soft)] text-[var(--brand)]">
          <ArrowDownToLine className="size-5" />
        </div>
        <h1 className="text-[var(--text-h2)] font-bold leading-tight text-[var(--ink)]">
          Deposit funds
        </h1>
        <p className="text-[var(--text-body)] text-[var(--fg-muted)]">
          Top up your wallet to start lending. Funds appear once your payment clears.
        </p>
      </header>

      {cancelled && (
        <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
          <XCircle className="size-5 shrink-0 text-[var(--danger)]" />
          <p className="text-[var(--fg-muted)]">
            Payment was cancelled — your wallet hasn’t been charged. You can try again below.
          </p>
        </div>
      )}

      <Card padding="lg" elevated className="space-y-5">
        <form action={action} className="space-y-5">
          <div>
            <label htmlFor="amount_eur">Amount</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] font-medium">
                €
              </span>
              <input
                id="amount_eur"
                name="amount_eur"
                type="number"
                min={10}
                max={2000}
                step={0.01}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="!pl-8 tabular"
              />
            </div>
            <p className="mt-1.5 text-[var(--text-sm)] text-[var(--fg-subtle)]">
              Min €10 · Max €2,000
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((v) => {
              const active = amount === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v)}
                  className={`rounded-[var(--radius-pill)] border px-4 py-1.5 text-sm font-semibold transition ${
                    active
                      ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                      : "border-[var(--border-strong)] text-[var(--fg-muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
                  }`}
                >
                  €{v}
                </button>
              );
            })}
          </div>

          {state?.error && (
            <p className="text-sm text-[var(--error)]">{state.error}</p>
          )}

          <SubmitBtn />
        </form>

        <div className="flex items-center justify-center gap-2 text-[var(--text-sm)] text-[var(--fg-subtle)]">
          <ShieldCheck className="size-4" />
          Secured by Stripe
        </div>
      </Card>

      <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-alt)] p-4 text-sm">
        <Info className="size-5 shrink-0 text-[var(--brand)]" />
        <div className="space-y-1 text-[var(--fg-muted)]">
          <p className="font-semibold text-[var(--ink)]">Sandbox / test mode</p>
          <p>
            No real money moves. Use card{" "}
            <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[var(--ink)] border border-[var(--border)]">
              4242 4242 4242 4242
            </code>
            , any future expiry, and any CVC.
          </p>
        </div>
      </div>
    </div>
  );
}
