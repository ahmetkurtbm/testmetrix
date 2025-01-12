"use client";

import { useState } from "react";
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
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Cookie'yi sil
      Cookies.remove("token");

      // Kullanıcıyı giriş ekranına yönlendirme
      router.push("/login");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <header className="flex items-center justify-between px-2 py-2 bg-gray-400 shadow-md">
      <nav className="flex space-x-3">
        <Avatar className="bg-green-400"></Avatar>
        <Link
          href="/folders"
          className="bg-slate-300 p-2 hover:shadow-md hover:bg-white rounded-md "
        >
          <span className="">Folders</span>
        </Link>
        <Link
          href="/excelupload"
          className="bg-slate-300 p-2 hover:shadow-md hover:bg-white rounded-md"
        >
          <p className="">Excel Upload</p>
        </Link>

        {/* <Link
          href="/excel-reports"
          className="bg-slate-300 p-2 hover:shadow-md hover:bg-white rounded-md "
        >
          <span className="">Excel Reports</span>
        </Link> */}
      </nav>

      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 bg-slate-300 "
            >
              <Avatar className="w-8 h-8 bg-blue-500 text-white"></Avatar>
              <span className="hidden sm:block">Profile</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mt-2">
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
                Logout
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
