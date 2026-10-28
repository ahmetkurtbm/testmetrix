import { Smartphone } from "lucide-react";
import { headers } from "next/headers";
import QRCode from "qrcode";

import { InstallApp } from "@/components/InstallApp";

/**
 * "Telefonunuza yükleyin" bölümü: kurulum düğmesi/talimatı ve bilgisayardan
 * gelenler için siteyi telefonda açan QR kod. QR, isteğin geldiği adresi kodlar;
 * böylece yerelde ve canlıda doğru adresi gösterir.
 */
export async function InstallSection() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "testmetrix.vercel.app";
  const protocol = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const url = `${protocol}://${host}/`;
  const qr = await QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#0f1b3d", light: "#ffffff" } });

  return (
    <section
      id="uygulama"
      aria-labelledby="uygulama-baslik"
      className="grid gap-8 overflow-hidden rounded-2xl bg-[#0f1b3d] p-8 text-white dark:bg-[#0a1228] sm:p-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
    >
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-400">
          <Smartphone aria-hidden="true" className="h-4 w-4" />
          Mobil uygulama
        </p>
        <h2 id="uygulama-baslik" className="mt-2 text-3xl font-semibold tracking-tight">
          TestMetrix&apos;i telefonunuza yükleyin
        </h2>
        <p className="mt-3 max-w-xl text-white/70">
          Uygulama mağazası gerekmez: ana ekranınıza eklenir, kendi simgesiyle tam ekran açılır ve raporlarınıza
          tek dokunuşla ulaşırsınız.
        </p>
        <div className="mt-6">
          <InstallApp tone="dark" />
        </div>
      </div>

      <figure className="hidden flex-col items-center gap-3 md:flex">
        <div
          className="h-40 w-40 rounded-xl bg-white p-2"
          role="img"
          aria-label={`${url} adresini telefonda açan QR kod`}
          dangerouslySetInnerHTML={{ __html: qr }}
        />
        <figcaption className="text-sm text-white/60">Telefon kamerasıyla okutun</figcaption>
      </figure>
    </section>
  );
}
