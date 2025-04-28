import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { ToastContainer, toast } from "react-toastify";
import { FolderPlus } from "lucide-react";

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

  const emptyError = () =>
    toast.warning("Klasör adı boş bırakılamaz!", {
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
    if (!folderName.trim()) {
      emptyError();
      return;
    }

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
    <div className="flex gap-1 rounded">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild onClick={() => setOpen(true)}>
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
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                placeholder="Klasör adı..."
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="col-span-4"
              />
            </div>
          </div>
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
