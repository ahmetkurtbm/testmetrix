"use client";

import { CheckCircle2, Download, Share, SquarePlus } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

/** Chrome/Edge'in kurulum olayı; standart tiplerde yok. */
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Platform = "unknown" | "standalone" | "ios" | "other";

const noopSubscribe = () => () => {};

function detectPlatform(): Platform {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return "standalone";
  const ios =
    /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return ios ? "ios" : "other";
}

/**
 * Ana ekrana ekleme durumu: Chrome/Edge/Android'de tarayıcının kurulum
 * penceresini açar, iOS'ta (Safari kurulum olayını desteklemez) adımları
 * gösterir, uygulama zaten tam ekran çalışıyorsa "yüklü" der.
 */
export function useInstallApp() {
  // Cihaz bilgisi yalnızca tarayıcıda okunur; sunucu çiziminde "unknown".
  const platform = useSyncExternalStore(noopSubscribe, detectPlatform, () => "unknown" as Platform);
  const [event, setEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setEvent(null);
      setInstalled(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const state =
    platform === "unknown"
      ? "unknown"
      : installed || platform === "standalone"
        ? "installed"
        : event
          ? "promptable"
          : platform === "ios"
            ? "ios"
            : "manual";

  const install = async () => {
    if (!event) return;
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setEvent(null);
  };

  return { state, install };
}

/** Kurulum düğmesi ya da cihaza göre talimat. */
export function InstallApp({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { state, install } = useInstallApp();
  const muted = tone === "dark" ? "text-white/70" : "text-gray-600";

  if (state === "unknown") return <div className="h-11" />;

  if (state === "installed") {
    return (
      <p className={`flex items-center gap-2 text-sm font-medium ${tone === "dark" ? "text-white" : "text-gray-900"}`}>
        <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-green-500" />
        Uygulama bu cihazda yüklü.
      </p>
    );
  }

  if (state === "promptable") {
    return (
      <Button onClick={install} className="h-11 bg-amber-400 px-5 text-[#0f1b3d] hover:bg-amber-300">
        <Download aria-hidden="true" />
        Uygulamayı yükle
      </Button>
    );
  }

  if (state === "ios") {
    return (
      <ol className={`space-y-2 text-sm ${muted}`}>
        <li className="flex items-center gap-2">
          <Share aria-hidden="true" className="h-4 w-4 shrink-0" />
          Safari&apos;de alttaki <strong className="font-semibold">Paylaş</strong> düğmesine dokunun.
        </li>
        <li className="flex items-center gap-2">
          <SquarePlus aria-hidden="true" className="h-4 w-4 shrink-0" />
          <strong className="font-semibold">Ana Ekrana Ekle</strong>&apos;yi seçip onaylayın.
        </li>
      </ol>
    );
  }

  return (
    <p className={`text-sm ${muted}`}>
      Tarayıcınızın menüsünden <strong className="font-semibold">“Uygulamayı yükle”</strong> ya da{" "}
      <strong className="font-semibold">“Ana ekrana ekle”</strong>yi seçin. Chrome ve Edge&apos;de adres çubuğundaki
      yükleme simgesi de aynı işi yapar.
    </p>
  );
}
