"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function ComboboxDemo({
  folderId,
  setFolderId,
}: {
  folderId: any;
  setFolderId: (_id: any) => void;
}) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;

  const [open, setOpen] = React.useState(false);
  const [folderName, setFolderName] = React.useState("");
  const [folders, setFolders] = React.useState<
    { _id: string; folder_name: string; created_at: string }[]
  >([]);

  React.useEffect(() => {
    const handleGetFolders = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/folders`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setFolders(data);
          // Set initial folder name if folderId exists
          const selectedFolder = data.find((f: any) => f._id === folderId);
          if (selectedFolder) {
            setFolderName(selectedFolder.folder_name);
          }
        } else {
          console.error("Klasörler yüklenemedi:", data.error);
        }
      } catch (error) {
        console.error("Klasör getirme hatası:", error);
      }
    };
    handleGetFolders();
  }, [BACKEND_URL, folderId]);

  const handleChange = (folderId: string, folderName: string) => {
    setFolderId(folderId);
    setFolderName(folderName);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-orange-500 text-white"
        >
          <span className="truncate">{folderName || "Klasör Seçin..."}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Klasör Ara..." className="h-9" />
          <CommandList>
            <CommandEmpty>Klasör Bulunamadı</CommandEmpty>
            <CommandGroup heading="Klasörler">
              {folders.map((folder) => (
                <CommandItem
                  key={folder._id}
                  value={folder.folder_name}
                  onSelect={() => {
                    handleChange(folder._id, folder.folder_name);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      folderId === folder._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{folder.folder_name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
