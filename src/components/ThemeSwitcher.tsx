"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { THEME_COOKIE, type Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Açık tema", icon: Sun },
  { value: "dark", label: "Koyu tema", icon: Moon },
  { value: "system", label: "Cihaz ayarı", icon: Monitor },
];

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
}

/** Açık / koyu / cihaz ayarı. Seçim anında uygulanır ve çereze yazılır. */
export function ThemeSwitcher({ initial, tone = "light" }: { initial: Theme; tone?: "light" | "dark" }) {
  const [theme, setTheme] = useState(initial);

  // Cihaz ayarı seçiliyken sistem teması değişirse sayfa da değişsin.
  useEffect(() => {
    if (theme !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [theme]);

  return (
    <div
      role="group"
      aria-label="Tema"
      className={`flex rounded-lg border p-0.5 ${tone === "dark" ? "border-white/15" : "border-gray-200"}`}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={theme === value}
          aria-label={label}
          title={label}
          onClick={() => {
            setTheme(value);
            applyTheme(value);
          }}
          className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
            theme === value
              ? "bg-blue-600 text-white"
              : tone === "dark"
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          }`}
        >
          <Icon aria-hidden="true" className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
