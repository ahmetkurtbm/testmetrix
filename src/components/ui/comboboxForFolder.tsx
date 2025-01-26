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

interface FolderName {
  value: string;
  label: string;
}

export function ComboboxDemo({
  folderNames,
  id,
}: {
  folderNames: FolderName[];
  id: any;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const handleChange = async (folderName: any) => {
    console.log(id, folderName);
    try {
      const response = await fetch(
        "http://localhost:5000/excel-update-folder-name",
        {
          method: "POST",
          body: JSON.stringify({ id: id, folderName: folderName }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        console.log("Excel Updated Successful");
      } else {
        console.error("Update failed:", data.error);
      }

      window.location.reload();
    } catch (error) {
      console.error("Error updating Excel:", error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[100px] justify-between bg-orange-500 text-white"
        >
          {value
            ? folderNames.find((folderName) => folderName.value === value)
                ?.label
            : "Taşı..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Klasör Ara..." className="h-9" />
          <CommandList>
            <CommandEmpty>Klasör Bulunamadı.</CommandEmpty>
            <CommandGroup>
              {folderNames.map((folderName) => (
                <CommandItem
                  key={folderName.value}
                  value={folderName.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    handleChange(currentValue);
                    setOpen(false);
                  }}
                >
                  {folderName.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === folderName.value ? "opacity-100" : "opacity-0"
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
