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

const Header = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();

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
    <header className="flex items-center justify-between px-2 py-2 bg-gray-400 shadow-md">
      <nav className="flex space-x-3">
        <Avatar className="bg-green-400">
          <img src="excelLogo.webp" />
        </Avatar>
        <Link
          href="/folders"
          className="bg-slate-300 p-2 hover:shadow-md hover:bg-white rounded-md "
        >
          <span className="">Klasörler</span>
        </Link>
        <Link
          href="/excel-upload"
          className="bg-slate-300 p-2 hover:shadow-md hover:bg-white rounded-md"
        >
          <p className="">Dosya Yükle</p>
        </Link>
      </nav>

      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 bg-slate-300 "
            >
              <Avatar className="w-8 h-8 bg-blue-500 text-white"></Avatar>
              <span className="hidden sm:block">Profil</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 mt-2">
            <DropdownMenuItem>
              <Link href="/profile" className=" w-full ">
                <p className="block w-full text-left bg-blue-300 p-3 rounded-md hover:bg-blue-500">
                  Profili Görüntüle
                </p>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Button
                className="block w-full text-left bg-red-600"
                onClick={handleLogout}
              >
                Çıkış Yap
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
