"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { FolderPlus } from "lucide-react";
import { apiPost } from "@/lib/api-client";

export default function FolderAdder({ onCreated }: { onCreated?: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!folderName.trim()) {
      toast.warning("Klasör adı boş bırakılamaz!", { theme: "dark" });
      return;
    }

    setSaving(true);
    try {
      await apiPost("/api/folders", { name: folderName.trim() });
      toast.success("Klasör eklendi.", { theme: "dark" });
      setOpen(false);
      setFolderName("");
      // Eskiden burada `window.location.reload()` vardı: tüm sayfayı ve tüm
      // JS paketini yeniden indiriyordu. Router yenilemesi sadece veriyi tazeler.
      onCreated?.();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Klasör eklenemedi.",
        { theme: "dark" }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-1 rounded">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <FolderPlus className="w-4 h-4 mr-2" />
            Klasör Ekle
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[90vw] sm:max-w-[425px] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Yeni Klasör Ekle</DialogTitle>
            <DialogDescription>
              Lütfen oluşturmak istediğiniz klasör adını giriniz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Klasör adı..."
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
