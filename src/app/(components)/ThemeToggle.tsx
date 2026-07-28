"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Açık/koyu tema anahtarı.
 *
 * Kaynak doğruluk `<html>` üzerindeki `dark` sınıfı — shadcn bileşenleri zaten
 * onu okuyor, görselleştirme token'ları da (`globals.css`) aynı sınıfa bağlı.
 * Tercih `localStorage`'da; seçim yapılmamışsa işletim sistemi ayarı geçerli.
 *
 * İlk boyamada yanlış temanın görünmemesi için asıl sınıf `layout.tsx`
 * içindeki senkron script tarafından, React yüklenmeden atanıyor.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // Sunucuda hangi temanın seçili olduğu bilinemez; buton yüklenene kadar
  // yer tutucu gösteriliyor ki hydration uyuşmazlığı olmasın.
  if (!mounted) {
    return <div className="w-9 h-9" aria-hidden />;
  }

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 inline-flex items-center justify-center rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
      aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
      title={isDark ? "Açık tema" : "Koyu tema"}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
