"use client";

import { ChevronDown, FolderOpen, Info, LogOut, Mail, Menu, Shield, Upload, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { signOutAction } from "@/app/actions/auth";
import { InstallApp } from "@/components/InstallApp";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Theme } from "@/lib/theme";

/** Oturum bilgisi sunucudan prop olarak gelir (bkz. (pages)/layout.tsx). */
type HeaderProps = {
  email: string;
  isAdmin: boolean;
  theme: Theme;
};

export function Brand({ tone = "dark" }: { tone?: "light" | "dark" }) {
  return (
    <span className="flex items-center gap-2.5">
      <img src="/favicon.svg" alt="" className="h-8 w-8" />
      <span className={`font-display text-lg font-semibold tracking-tight ${tone === "dark" ? "text-white" : "text-gray-900"}`}>
        TestMetrix
      </span>
    </span>
  );
}

const Header = ({ email, isAdmin, theme }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const primary = [
    { href: "/folders", label: "Klasörler", icon: FolderOpen },
    { href: "/excel-upload", label: "Sınav yükle", icon: Upload },
    ...(isAdmin ? [{ href: "/dashboard", label: "Yönetim", icon: Shield }] : []),
  ];
  const secondary = [
    { href: "/information", label: "Hakkında", icon: Info },
    { href: "/iletisim", label: "İletişim", icon: Mail },
  ];
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`) || (href === "/folders" && pathname.startsWith("/excel-"));

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0f1b3d] text-white dark:bg-[#0a1228]">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Menüyü aç"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white md:hidden"
              >
                <Menu aria-hidden="true" className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-[300px] flex-col bg-surface p-0">
              <SheetTitle className="sr-only">Menü</SheetTitle>
              <div className="bg-[#0f1b3d] px-5 py-5 dark:bg-[#0a1228]">
                <Brand />
              </div>
              <nav className="flex flex-1 flex-col gap-1 p-3" onClick={() => setIsOpen(false)}>
                {[...primary, ...secondary].map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                      isActive(href) ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon aria-hidden="true" className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="space-y-3 border-t border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Tema</span>
                  <ThemeSwitcher initial={theme} />
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="mb-2 text-sm font-medium text-gray-700">Telefona yükle</p>
                  <InstallApp />
                </div>
                <p className="truncate text-sm text-gray-500">{email}</p>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    Çıkış yap
                  </button>
                </form>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/folders" aria-label="TestMetrix ana sayfa">
            <Brand />
          </Link>

          <div className="ml-4 hidden h-16 items-stretch gap-1 md:flex">
            {primary.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`flex items-center border-b-2 px-3 text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "border-amber-400 text-white"
                    : "border-transparent text-white/70 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex">
            {secondary.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive(href) ? "text-white" : "text-white/70 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="hidden sm:block">
            <ThemeSwitcher initial={theme} tone="dark" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 text-white/90 hover:bg-white/10"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm font-semibold text-[#0f1b3d]">
                  {email[0]?.toLocaleUpperCase("tr")}
                </span>
                <ChevronDown aria-hidden="true" className="hidden h-4 w-4 sm:block" />
                <span className="sr-only">Hesap menüsü</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <div className="px-2 py-1.5">
                <p className="text-xs text-gray-500">Oturum açık</p>
                <p className="truncate text-sm font-medium text-gray-900">{email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex w-full items-center gap-2">
                  <User aria-hidden="true" className="h-4 w-4" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <form action={signOutAction} className="w-full">
                  <button type="submit" className="flex w-full items-center gap-2 text-red-600">
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    Çıkış yap
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

export default Header;
