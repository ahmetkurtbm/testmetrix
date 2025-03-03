import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ToastContainer, toast } from "react-toastify";

export default function FolderAdder() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;

  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  const handleAddFolder = () => {
    setOpen(true);
  };

  const success = () =>
    toast.success("Klasör Eklendi.", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const error = () =>
    toast.error("Klasör Ekleme Başarısız, Bir Hata Oluştu!", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const handleSave = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/upload-folder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderName: folderName,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        success();
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        error();
        console.error("Upload failed:", data.error);
      }
    } catch (err) {
      error();
      console.error("Error uploading Folder:", err);
    }
    setOpen(false);
    setFolderName("");
  };

  return (
    <div className="flex gap-1">
      <Button onClick={handleAddFolder}>Klasör Ekle</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Klasör İsmi Gir</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Klasör adı..."
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSave}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
