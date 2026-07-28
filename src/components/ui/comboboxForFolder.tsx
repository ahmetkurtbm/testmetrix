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
import { apiGet } from "@/lib/api-client";
import type { FolderSummary } from "@/features/exams/types";

export function ComboboxDemo({
  folderId,
  setFolderId,
}: {
  folderId: string | undefined;
  setFolderId: (id: string | undefined) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [folders, setFolders] = React.useState<FolderSummary[]>([]);

  React.useEffect(() => {
    apiGet<FolderSummary[]>("/api/folders")
      .then(setFolders)
      .catch((error) => console.error("Klasörler yüklenemedi:", error));
  }, []);

  const selectedName = folders.find((f) => f.id === folderId)?.name;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-orange-500 text-white"
        >
          <span className="truncate">{selectedName || "Klasör Seçin..."}</span>
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
                  key={folder.id}
                  value={folder.name}
                  onSelect={() => {
                    setFolderId(folder.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      folderId === folder.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{folder.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
