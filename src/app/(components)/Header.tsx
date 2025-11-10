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
import { deleteCookie } from "@/lib/my-utils";

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

  // Add state for sheet open/close
  const [isOpen, setIsOpen] = useState(false);

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
    //checkAuth();
  }, []);

  const handleLogout = async () => {
    // try {
    //   await fetch(`${BACKEND_URL}/logout`, {
    //     method: "GET",
    //   });

    //   router.push("/login"); // Sayfayı yönlendir
    //   window.location.reload(); // Sayfayı yenileyerek çerezi tamamen temizle
    // } catch (error) {
    //   console.error("Çıkış yaparken hata oluştu:", error);
    // }
    deleteCookie();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="flex h-16 items-center px-4 sm:px-6">
        <div className="flex w-full items-center justify-between">
          {/* Logo ve Sol Menü */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button - Moved to far left */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[300px] sm:w-[400px] bg-gradient-to-br from-slate-50 to-white"
                onPointerDownOutside={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                }}
              >
                {/* Header Section */}
                <div className="mb-8 mt-2">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="h-12 w-auto mb-4"
                  />
                  <h2 className="text-xl font-semibold text-gray-800">Menü</h2>
                  <div className="h-1 w-20 bg-blue-600 mt-2 rounded-full"></div>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col space-y-1">
                  <Link
                    href="/folders"
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:text-blue-600"
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                    Klasörler
                  </Link>

                  <Link
                    href="/excel-upload"
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:text-blue-600"
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Dosya Yükle
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:text-blue-600"
                    >
                      <svg
                        className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                      Yönetim
                    </Link>
                  )}

                  {/* Divider */}
                  <div className="my-4 border-t border-gray-200"></div>

                  <Link
                    href="/information"
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:text-blue-600"
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Hakkımızda
                  </Link>

                  <Link
                    href="/iletisim"
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:text-blue-600"
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    İletişim
                  </Link>
                </nav>

                {/* User Section - modify logout button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 bg-blue-600 text-white">
                      <span className="text-sm">{mail[0]?.toUpperCase()}</span>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {mail}
                      </p>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          handleLogout();
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo - Moved next to hamburger menu */}
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
