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

export default function FolderAdder() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;

  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  const handleAddFolder = () => {
    setOpen(true);
  };

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
        ("Folder Upload Successful");
      } else {
        console.error("Upload failed:", data.error);
      }
    } catch (error) {
      console.error("Error uploading Folder:", error);
    }
    setOpen(false);
    setFolderName("");
  };

  return (
    <div className="flex p-1 gap-1">
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
