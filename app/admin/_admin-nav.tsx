"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/pending-kyc", label: "Pending KYC" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/loans", label: "Loans" },
  { href: "/admin/audit-log", label: "Audit log" },
];

function isActive(pathname: string, href: string) {
  // "/admin" only matches the overview exactly; the rest match nested routes.
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminNav({ className = "", itemClassName = "" }: { className?: string; itemClassName?: string }) {
  const pathname = usePathname();
  return (
    <nav className={className}>
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className={`adm-nav ${itemClassName} ${isActive(pathname, n.href) ? "is-active" : ""}`}
        >
          {n.label}
        </Link>
      ))}
    </nav>
  );
}
