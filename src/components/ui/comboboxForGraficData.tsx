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
    value: "Madde Başına Yüzde Haritası (Percentage Map Per Question)",
    label: "Madde Başına Yüzde Haritası (Percentage Map Per Question)",
  },
  {
    value: "Başarı Oranları (Success Rates)",
    label: "Başarı Oranları (Success Rates)",
  },
  {
    value: "Z Puanları (Z-Scores)",
    label: "Z Puanları (Z-Scores)",
  },
  {
    value: "T Puanları (T-Scores)",
    label: "T Puanları (T-Scores)",
  },
  {
    value: "Sıralamalar (Ranks)",
    label: "Sıralamalar (Ranks)",
  },
  {
    value: "Madde Bazında Varyans (Item Variance)",
    label: "Madde Bazında Varyans (Item Variance)",
  },
  {
    value: "Madde Bazında Standart Sapma (Item Standard Deviation)",
    label: "Madde Bazında Standart Sapma (Item Standard Deviation)",
  },
  {
    value: "Madde Zorluk İndeksi (Item Difficulty Index)",
    label: "Madde Zorluk İndeksi (Item Difficulty Index)",
  },
  {
    value: "Madde Toplam Korelasyon Katsayısı (RBis)",
    label: "Madde Toplam Korelasyon Katsayısı (RBis)",
  },
  {
    value: "Çift Katsayılı Kolerasyon Değeri (pRBis)",
    label: "Çift Katsayılı Kolerasyon Değeri (pRBis)",
  },
  {
    value: "Ayırt Edicilik İndeksi (Discrimination Index)",
    label: "Ayırt Edicilik İndeksi (Discrimination Index)",
  },
  {
    value: "Güvenirlik İndeksi (Reliability Index)",
    label: "Güvenirlik İndeksi (Reliability Index)",
  },
];

export function ComboboxForData({
  value,
  setValue,
}: {
  value: any;
  setValue: any;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[32rem]"
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : "Veri seçiniz..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
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
                  {framework.label}
                  <Check
                    className={cn(
                      "ml-auto",
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
