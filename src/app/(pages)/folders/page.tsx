"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useState, useEffect } from "react";
import { ComboboxDemo } from "@/components/ui/comboboxForFolder2";
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddFolder from "@/app/(components)/AddFolder";

interface File {
  _id: string;
  folder_id: string;
  file_name: string;
  created_at: string;
}

interface FolderNames {
  _id: string;
  folder_name: string;
  created_at: string;
}

export default function Home() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;

  const router = useRouter();

  const [excels, setExcels] = useState<File[]>([]);
  const [folders, setFolders] = useState<FolderNames[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [folderId, setFolderId] = useState<string>();

  // Token Kontrolü
  useEffect(() => {
    if (!Cookies.get("token")) {
      router.push("/login");
    }
  }, []);

  // Get Folders
  useEffect(() => {
    async function fetchFolders() {
      try {
        const response = await fetch(`${BACKEND_URL}/folders`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data: FolderNames[] = await response.json();

        setFolders(data);
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    }

    fetchFolders();
  }, []);

  // Get Excels
  useEffect(() => {
    async function fetchExcels() {
      try {
        const response = await fetch(`${BACKEND_URL}/excels`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data: File[] = await response.json();

        setExcels(data);
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    }

    fetchExcels();
  }, []);

  const handleUpdateFolders = async (folderId: any, newName: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/update-folder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: folderId, folder_name: newName }),
      });

      if (response.ok) {
        setFolders((prevFolders) =>
          prevFolders.map((folder) =>
            folder._id === folderId
              ? { ...folder, folder_name: newName }
              : folder
          )
        );
        setIsEditing(false);
      } else {
        console.error("Güncelleme başarısız");
      }
    } catch (error) {
      console.error("Hata oluştu:", error);
    }
  };

  const handleDeleteFolders = async (folderId: any) => {
    try {
      const response = await fetch(`${BACKEND_URL}/delete-folder`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: folderId }),
      });

      if (response.ok) {
        setFolders((prevFolders) =>
          prevFolders.filter((folder) => folder._id !== folderId)
        );

        setIsEditing(false);
      } else {
        console.error("Silme başarısız");
      }
    } catch (error) {
      console.error("Hata oluştu:", error);
    }
  };

  const handleDeleteExcel = async (fileId: any) => {
    try {
      const response = await fetch(`${BACKEND_URL}/excel-delete`, {
        method: "DELETE",
        body: JSON.stringify({ fileId }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Excel Deleted Successful");
      } else {
        console.error("Delete failed:", data.error);
      }
    } catch (error) {
      console.error("Error deleting Excel:", error);
    }
  };

  const handleUpdate = async (fileId: any) => {
    router.push(`/excel-update?file-id=${fileId}`);
  };

  const handleRaports = async (fileId: any) => {
    router.push(`/excel-reports?file-id=${fileId}`);
  };

  return (
    <div>
      <div className="flex p-1 gap-1">
        <AddFolder></AddFolder>
      </div>
      {folders.map((folder) => (
        <Card key={folder.folder_name} className="mb-4 m-3 border-black">
          <CardHeader>
            <div className="flex w-full justify-between items-center text-center gap-1 bg-slate-300 p-1 rounded-md">
              <h2 className="text-xl font-semibold bg-gray-400 rounded-md py-1 px-2">
                {folder.folder_name}
              </h2>
              <p className="text-sm text-gray-500 ml-auto">
                {new Date(folder.created_at).toLocaleString()}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <img src="threeDots.svg" alt="Menü" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="p-2 w-48">
                  {isEditing ? (
                    <div className="flex items-center gap-2 p-2">
                      <Input
                        defaultValue={folder.folder_name}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newName = e.target.value;
                          setFolders((prevFolders) =>
                            prevFolders.map((f) =>
                              f._id === folder._id
                                ? { ...f, folder_name: newName }
                                : f
                            )
                          );
                        }}
                        className="h-8 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          handleUpdateFolders(folder._id, folder.folder_name);
                        }}
                      >
                        Kaydet
                      </Button>
                    </div>
                  ) : (
                    <div
                      className=" hover:bg-green-500 hover:text-white bg-slate-300 m-1 relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-green-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                    >
                      İsmi Düzenle
                    </div>
                  )}
                  <DropdownMenuItem
                    onClick={() => handleDeleteFolders(folder._id)}
                    className="text-red-500 hover:bg-red-500 hover:text-white bg-slate-300 m-1"
                  >
                    Klasörü Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 m-3">
              {excels
                .filter((excel) => excel.folder_id === folder._id) // Sadece eşleşenleri al
                .map((excel) => (
                  <li
                    key={excel._id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium text-blue-700">
                        {excel.file_name}
                      </span>
                      <span className="text-sm text-gray-400 ml-2">
                        {new Date(excel.created_at).toLocaleString()}
                      </span>
                    </div>
                    <TooltipProvider>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-blue-500 text-white"
                              onClick={() => handleUpdate(excel._id)}
                            >
                              Düzenle
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Excel Dosyanızı Düzenleyebilirsiniz
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-green-500 text-white"
                              onClick={() => handleRaports(excel._id)}
                            >
                              Raporlar
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Excel Dosyanızın Raporlarını ve Grafiklerini
                            Görebilirsiniz
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <ComboboxDemo
                              folderId={folderId}
                              setFolderId={setFolderId}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            Excel Raporunuzu İstediğiniz Klasöre
                            Taşıyabilirsiniz
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-500 text-white"
                              onClick={() => handleDeleteExcel(excel._id)}
                            >
                              Sil
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Excel Dosyanızı Silebilirsiniz
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
