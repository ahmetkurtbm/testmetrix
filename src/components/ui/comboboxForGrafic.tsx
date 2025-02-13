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
    value: "line",
    label: "Çizgi Grafiği",
  },
  {
    value: "bar",
    label: "Çubuk Grafik",
  },
  {
    value: "pie",
    label: "Daire Grafik",
  },
  {
    value: "radar",
    label: "Radar Grafik",
  },
  {
    value: "doughnut",
    label: "Doughnut Grafik",
  },
];

export function ComboboxForGrafic({
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
          className="w-[24rem]"
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : "Grafik seçiniz..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Grafik ara..." className="h-9" />
          <CommandList>
            <CommandEmpty>grafik bulunamadı.</CommandEmpty>
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
