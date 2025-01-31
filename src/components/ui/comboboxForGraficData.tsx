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
    value: "scores",
    label: "Öğrencilerin Puanları",
  },
  {
    value: "percentageMapPerQuestion",
    label: "Percentage Map Per Question (Soru Başına Yüzde Haritası)",
  },
  {
    value: "successRates",
    label: "Success Rates (Başarı Oranları)",
  },
  {
    value: "zScores",
    label: "Z-Scores (Z Puanları)",
  },
  {
    value: "tScores",
    label: "T-Scores (T Puanları)",
  },
  {
    value: "ranks",
    label: "Ranks (Sıralamalar)",
  },
  {
    value: "variancePerItem",
    label: "Item Variance (Soru Bazında Varyans)",
  },
  {
    value: "stdDevPerItem",
    label: "Item Standard Deviation (Soru Bazında Standart Sapma)",
  },
  {
    value: "difficultyIndex",
    label: "Item Difficulty Index (Soru Zorluk İndeksi)",
  },
  {
    value: "rbisIndex",
    label: "RBis (Madde Toplam Korelasyon Katsayısı)",
  },
  {
    value: "prbisIndex",
    label: "pRBis (Düzeltilmiş RBis)",
  },
  {
    value: "discriminationIndex",
    label: "Discrimination Index (Ayırt Edicilik İndeksi)",
  },
  {
    value: "reliabilityIndex",
    label: "Reliability Index (Güvenirlik İndeksi)",
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
            : "Data seçiniz..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search data..." className="h-9" />
          <CommandList>
            <CommandEmpty>No data found.</CommandEmpty>
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
