import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEur(cents: number): string {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function formatBps(bps: number): string {
  return (bps / 100).toFixed(2) + "%";
}

export function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("en-IE", { year: "numeric", month: "short", day: "numeric" });
}

export function getClientIp(headers: Headers): string {
  return headers.get("x-forwarded-for") ?? headers.get("x-real-ip") ?? "unknown";
}

const VOWELS = new Set("AEIOUaeiou");

// Anonymise a name for lender-facing listings: keep vowels, replace other
// letters with underscores, preserve spaces. "John Smith" -> "_o__ __i__".
export function maskName(name: string | null | undefined): string {
  if (!name) return "";
  let out = "";
  for (const ch of name) {
    if (ch === " ") out += " ";
    else if (/[a-zA-Z]/.test(ch)) out += VOWELS.has(ch) ? ch : "_";
  }
  return out;
}
