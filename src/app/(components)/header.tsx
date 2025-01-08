"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

const Header = () => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-2 py-2 bg-gray-200 shadow-md">
      {/* Sol Taraf: Yönlendirmeler */}
      <nav className="flex space-x-6">
        <Link
          href="/excel-upload"
          className="bg-gray-300 p-2 hover:shadow-md hover:bg-gray-400 rounded-md"
        >
          <p className="text-gray-700 hover:text-gray-900 font-medium">
            Excel Upload
          </p>
        </Link>
        <Link
          href="/folders"
          className="bg-gray-300 p-2 hover:shadow-md hover:bg-gray-400 rounded-md"
        >
          <span className="text-gray-700 hover:text-gray-900 font-medium">
            Folders
          </span>
        </Link>
        <Link
          href="/excel-viewer"
          className="bg-gray-300 p-2 hover:shadow-md hover:bg-gray-400 rounded-md"
        >
          <span className="text-gray-700 hover:text-gray-900 font-medium">
            Excel Viewer
          </span>
        </Link>
        <Link
          href="/excel-reports"
          className="bg-gray-300 p-2 hover:shadow-md hover:bg-gray-400 rounded-md"
        >
          <span className="text-gray-700 hover:text-gray-900 font-medium">
            Excel Reports
          </span>
        </Link>
      </nav>

      {/* Sağ Taraf: Profil Sekmesi */}
      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <Avatar className="w-8 h-8 bg-blue-500 text-white">Avatar</Avatar>
              <span className="hidden sm:block">Profile</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mt-2">
            <DropdownMenuItem>
              <Link href="/profile">
                <p className="block w-full text-left">View Profile</p>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <button
                className="block w-full text-left"
                onClick={() => alert("Logged out!")}
              >
                Logout
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
