"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOutAction } from "@/app/actions/auth";

/**
 * Oturum bilgisi artık prop olarak geliyor (bkz. (pages)/layout.tsx).
 * Eskiden bu bileşen `useEffect` içinde önce bir server action ile cookie'yi
 * okuyor, sonra backend'e `/user-authentication` isteği atıyordu: her sayfa
 * yüklemesinde iki fazladan gidiş-dönüş, üstelik koruma render'dan sonra.
 */
type HeaderProps = {
  email: string;
  isAdmin: boolean;
};

const Header = ({ email, isAdmin }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = (
    <>
      <Link
        href="/folders"
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-50 transition-colors"
      >
        Klasörler
      </Link>
      <Link
        href="/excel-upload"
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-50 transition-colors"
      >
        Dosya Yükle
      </Link>
      {isAdmin && (
        <Link
          href="/dashboard"
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-50 transition-colors"
        >
          Yönetim
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="flex h-16 items-center px-4 sm:px-6">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobil menü */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[300px] sm:w-[400px] bg-gray-50"
              >
                <div className="mb-8 mt-2">
                  <img src="/logo.png" alt="TestMetrix" className="h-12 w-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-800">Menü</h2>
                  <div className="h-1 w-20 bg-blue-600 mt-2 rounded-full" />
                </div>

                <nav
                  className="flex flex-col space-y-1"
                  onClick={() => setIsOpen(false)}
                >
                  <Link
                    href="/folders"
                    className="px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    Klasörler
                  </Link>
                  <Link
                    href="/excel-upload"
                    className="px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    Dosya Yükle
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/dashboard"
                      className="px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Yönetim
                    </Link>
                  )}

                  <div className="my-4 border-t border-gray-200" />

                  <Link
                    href="/information"
                    className="px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    Hakkımızda
                  </Link>
                  <Link
                    href="/iletisim"
                    className="px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    İletişim
                  </Link>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 bg-blue-600 text-white">
                      <span className="text-sm">{email[0]?.toUpperCase()}</span>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {email}
                      </p>
                      <form action={signOutAction}>
                        <button
                          type="submit"
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Çıkış Yap
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/folders" className="flex items-center">
              <img src="/logo.png" alt="TestMetrix" className="h-8 sm:h-10 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-1">{navLinks}</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/information"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-50 transition-colors"
              >
                Hakkımızda
              </Link>
              <Link
                href="/iletisim"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md hover:bg-gray-50 transition-colors"
              >
                İletişim
              </Link>
            </div>

            <div className="hidden md:block border-l h-6 mx-2 border-gray-200" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-gray-50"
                >
                  <Avatar className="h-8 w-8 bg-blue-600 text-white">
                    <span className="text-sm">{email[0]?.toUpperCase()}</span>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[200px] truncate">
                    {email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuItem className="py-2" asChild>
                  <Link href="/profile" className="flex items-center w-full">
                    <span className="text-sm font-medium text-gray-700">
                      Profili Görüntüle
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2" asChild>
                  <form action={signOutAction} className="w-full">
                    <button
                      type="submit"
                      className="flex items-center w-full text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Çıkış Yap
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
