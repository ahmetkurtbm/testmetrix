"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Menu } from "lucide-react"; // Import hamburger icon
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Token'ın yapısını tanımlayın
interface DecodedToken {
  role: string;
  email: string;
  userId?: string;
  exp?: number;
  iat?: number;
}

const Header = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [mail, setMail] = useState("Profil");

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch(`${BACKEND_URL}/user-authentication`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setMail(data.user.email);

        if (data.user.role === "Yönetici") {
          setIsAdmin(true);
        }
      } else {
        router.push("/login");
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/logout`, {
        method: "POST",
        credentials: "include", // Çerezleri backend'e gönderir
      });

      router.push("/login"); // Sayfayı yönlendir
      window.location.reload(); // Sayfayı yenileyerek çerezi tamamen temizle
    } catch (error) {
      console.error("Çıkış yaparken hata oluştu:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="flex h-16 items-center px-4 sm:px-6">
        <div className="flex w-full items-center justify-between">
          {/* Logo ve Sol Menü */}
          <div className="flex items-center gap-6">
            <Link href="/folders" className="flex items-center">
              <img src="/logo.png" alt="Logo" className="h-8 sm:h-10 w-auto" />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
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
            </div>
          </div>

          {/* Sağ Menü */}
          <div className="flex items-center gap-2">
            {/* Desktop Links */}
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

            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="mr-1">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4">
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
                </nav>
              </SheetContent>
            </Sheet>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-gray-50"
                >
                  <Avatar className="h-8 w-8 bg-blue-600 text-white">
                    <span className="text-sm">{mail[0]?.toUpperCase()}</span>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {mail}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuItem className="py-2">
                  <Link href="/profile" className="flex items-center w-full">
                    <span className="text-sm font-medium text-gray-700">
                      Profili Görüntüle
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Çıkış Yap
                  </button>
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
