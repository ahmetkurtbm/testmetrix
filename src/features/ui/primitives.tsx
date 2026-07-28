"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Ortak ekran parçaları.
 *
 * Ekranların birbirine benzemesi kopyala-yapıştırla değil, bu parçalarla
 * sağlanıyor: bir kartın kenarlığı ya da bir başlığın ölçüsü değişecekse tek
 * yerde değişiyor. Renkler `--viz-*` rollerini kullandığı için tema anahtarı
 * her ekranda kendiliğinden çalışıyor.
 *
 * Tipografi ölçeği (rapor ekranında belirlendi):
 *   sayfa başlığı  text-xl
 *   bölüm başlığı  text-sm font-medium
 *   gövde/tablo    text-sm
 *   yardımcı metin text-xs
 */

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--viz-surface)]">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">{children}</div>
    </div>
  );
}

export function PageHeader({
  title,
  meta,
  actions,
}: {
  title: string;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-[var(--viz-text)] truncate">
          {title}
        </h1>
        {meta && (
          <p className="mt-0.5 text-sm text-[var(--viz-text-secondary)]">{meta}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-black/5 dark:border-white/10 bg-[var(--viz-surface-raised)] p-5 ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionTitle({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-medium text-[var(--viz-text)]">{title}</h2>
      {hint && (
        <p className="mt-0.5 text-xs text-[var(--viz-text-secondary)]">{hint}</p>
      )}
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-black/5 dark:border-white/10 bg-[var(--viz-surface-raised)] p-4">
      <div className="text-xs text-[var(--viz-text-secondary)]">{label}</div>
      {/* Büyük tek sayıda orantılı rakam; tabular-nums yalnızca hizalanan sütunlarda */}
      <div className="mt-1 text-2xl font-semibold text-[var(--viz-text)]">{value}</div>
      {hint && <div className="mt-1 text-xs text-[var(--viz-text-muted)]">{hint}</div>}
    </div>
  );
}

/** Satır içi oransal ölçek — tabloda sayının yanında bağlam verir. */
export function Meter({ value, max = 1 }: { value: number; max?: number }) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <span className="inline-block h-1.5 w-20 rounded-full bg-[var(--viz-series-soft)] overflow-hidden align-middle">
      <span
        className="block h-full rounded-full"
        style={{ width: `${ratio * 100}%`, background: "var(--viz-series)" }}
      />
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: string;
  title: string;
  body?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="py-12 text-center">
      {icon && <div className="text-3xl mb-2">{icon}</div>}
      <p className="text-sm font-medium text-[var(--viz-text)]">{title}</p>
      {body && (
        <p className="mt-1 text-xs text-[var(--viz-text-secondary)] max-w-sm mx-auto">
          {body}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-block px-3 py-2 text-sm rounded-md bg-[var(--viz-series)] text-white hover:opacity-90 transition-opacity"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-2 text-sm rounded-md bg-[var(--viz-series)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  href,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}) {
  const className =
    "px-3 py-2 text-sm rounded-md border border-black/10 dark:border-white/15 text-[var(--viz-text-secondary)] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50 transition-colors";

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  );
}

/** Tablo kabuğu — kenarlık, kaydırma ve hizalanmış rakamlar tek yerde. */
export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-black/5 dark:border-white/10">
      <table
        className="min-w-full text-sm"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  align = "left",
  onSort,
  sorted,
}: {
  children: ReactNode;
  align?: "left" | "right";
  onSort?: () => void;
  sorted?: "asc" | "desc" | null;
}) {
  return (
    <th
      onClick={onSort}
      aria-sort={sorted ? (sorted === "asc" ? "ascending" : "descending") : "none"}
      className={`px-3 py-2 font-medium text-${align} ${
        onSort ? "cursor-pointer select-none hover:text-[var(--viz-text)]" : ""
      }`}
    >
      {children}
      {sorted && (
        <span className="ml-1 text-[var(--viz-text-muted)]">
          {sorted === "asc" ? "↑" : "↓"}
        </span>
      )}
    </th>
  );
}
