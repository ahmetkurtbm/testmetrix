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

const frameworks = [
  {
    value: "Öğrencilerin Puanları",
    label: "Öğrencilerin Puanları",
  },
  {
    value: "Öğrenci Puanlarının Frekansları",
    label: "Öğrenci Puanlarının Frekansları",
  },
  {
    value: "Madde Güçlük İndeksi",
    label: "Madde Güçlük İndeksi",
  },
  {
    value: "Başarı Yüzdeleri",
    label: "Başarı Yüzdeleri",
  },
  {
    value: "Z Puanları",
    label: "Z Puanları",
  },
  {
    value: "T Puanları",
    label: "T Puanları",
  },
  // {
  //   value: "Öğrenci Sıralamaları",
  //   label: "Öğrenci Sıralamaları",
  // },
  {
    value: "Madde Bazında Varyans",
    label: "Madde Bazında Varyans",
  },
  {
    value: "Madde Bazında Standart Sapma",
    label: "Madde Bazında Standart Sapma",
  },
  {
    value: "Madde Toplam Korelasyon Katsayısı (Bis)",
    label: "Madde Toplam Korelasyon Katsayısı (Bis)",
  },
  {
    value: "Çift Katsayılı Kolerasyon Değeri (pBis)",
    label: "Çift Katsayılı Kolerasyon Değeri (pBis)",
  },
  {
    value: "Ayırt Edicilik İndeksi",
    label: "Ayırt Edicilik İndeksi",
  },
  {
    value: "Güvenirlik İndeksi",
    label: "Güvenirlik İndeksi",
  },
];

export function ComboboxForData({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">
            {value
              ? frameworks.find((framework) => framework.value === value)?.label
              : "Veri seçiniz..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Veri ara..." className="h-9" />
          <CommandList>
            <CommandEmpty>Veri bulunamadı.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <span className="truncate">{framework.label}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === framework.value ? "opacity-100" : "opacity-0"
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
