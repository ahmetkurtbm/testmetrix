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
    { _id: any; folder_name: string; created_at: any }[]
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
        } else {
          console.error("Update failed:", data.error);
        }
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };
    handleGetFolders();
  }, [BACKEND_URL]);

  const handleChange = (folderId: any, folderName: string) => {
    setFolderId(folderId); // Seçilen klasörün ID'sini güncelle
    setFolderName(folderName); // Seçilen klasörün adını güncelle
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-1/2 justify-between bg-orange-500 text-white"
        >
          {folderName || "Klasörler..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Klasör Ara..." className="h-9" />
          <CommandList>
            <CommandEmpty>Klasör Bulunamadı.</CommandEmpty>
            <CommandGroup>
              {folders.map((folder, index) => (
                <CommandItem
                  key={folder._id || index}
                  value={folder.folder_name}
                  onSelect={() => {
                    handleChange(folder._id, folder.folder_name);
                    setOpen(false);
                  }}
                >
                  {folder.folder_name}
                  <Check
                    className={cn(
                      "ml-auto",
                      folderId === folder._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
