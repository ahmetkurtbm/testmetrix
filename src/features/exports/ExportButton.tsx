"use client";

import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Tüm dışa aktarma düğmelerinin ortak kabuğu.
 *
 * Eski altı bileşen aynı JSX'i ve aynı `<img src="/download-icon.svg">`
 * bloğunu tekrarlıyordu; hiçbiri yükleniyor durumu ya da hata yakalama
 * göstermiyordu — ExcelJS bir hata fırlatırsa düğmeye basılmış ama hiçbir şey
 * olmamış gibi görünüyordu.
 */
export function ExportButton({
  label,
  onExport,
}: {
  label: string;
  onExport: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <Button
      variant="outline"
      className="w-full flex justify-between items-center gap-2 text-sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        setFailed(false);
        try {
          await onExport();
        } catch (error) {
          console.error(`${label} oluşturulamadı:`, error);
          setFailed(true);
        } finally {
          setBusy(false);
        }
      }}
    >
      <span className="truncate text-left">
        {busy ? "Hazırlanıyor…" : failed ? `${label} oluşturulamadı, tekrar deneyin` : label}
      </span>
      <FileSpreadsheet aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-500" />
    </Button>
  );
}
