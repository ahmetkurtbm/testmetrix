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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddFolder from "@/app/(components)/AddFolder";
import { ToastContainer, toast } from "react-toastify";

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

export default function Folders() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();

  const successSaveFolder = () =>
    toast.success("Klasör Başarıyla Kaydedildi!", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const successUpdateFolder = () =>
    toast.success("Klasör İsmi Güncellendi!", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const successDeleteFolder = () =>
    toast.success("Klasör Silindi!", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const successDeleteExcel = () =>
    toast.success("Veri Dosyası Silindi!", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const errorSaveFolder = () =>
    toast.error("Klasör Kaydedilemedi!", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const errorUpdateFolder = () =>
    toast.error("Klasör İsmi GÜncellenemedi!", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const errorDeleteFolder = () =>
    toast.error("Klasör Silinemedi!", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const errorDeleteExcel = () =>
    toast.error("Veri Dosyası Silinemedi!", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const [excels, setExcels] = useState<File[]>([]);
  const [folders, setFolders] = useState<FolderNames[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [filteredExcels, setFilteredExcels] = useState<File[]>([]);
  const [filteredFolders, setFilteredFolders] = useState<FolderNames[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>("");

  // Token Kontrolü // get folder // get excel
  useEffect(() => {
    async function fetchFolders() {
      try {
        const response = await fetch(`${BACKEND_URL}/folders`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data: FolderNames[] = await response.json();
        setFolders(data);
      } catch (error) {
        console.error("Error fetching folders:", error);
        router.push("/login");
      }
    }
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

    const checkAuth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/user-authentication`, {
          method: "GET",
          credentials: "include", // Çerezleri otomatik ekler
        });

        if (!response.ok) {
          router.push("/login");
        } else if (response.ok) {
          fetchExcels();
          fetchFolders();
        }
      } catch (error) {
        console.error("Kimlik doğrulama hatası:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Filtered results based on search query
    setFilteredExcels(
      excels.filter((file) =>
        file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    setFilteredFolders(
      folders.filter((folder) =>
        folder.folder_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [folders, excels, searchQuery]);

  const handleUpdateFolders = async (folderId: any, newName: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/update-folder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: folderId, folder_name: newName }),
        credentials: "include",
      });

      if (response.ok) {
        console.log("hey");
        successUpdateFolder();
        setFolders((prevFolders) =>
          prevFolders.map((folder) =>
            folder._id === folderId
              ? { ...folder, folder_name: newName }
              : folder
          )
        );
        setIsEditing(false);
      } else {
        errorUpdateFolder();
        console.error("Güncelleme başarısız");
      }
    } catch (error) {
      errorUpdateFolder();
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
        credentials: "include",
      });

      if (response.ok) {
        successDeleteFolder();
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
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        successDeleteExcel();
        setExcels((prevExcels) =>
          prevExcels.filter((excel) => excel._id !== fileId)
        );
      } else {
        errorDeleteExcel();
        console.error("Delete failed:", data.error);
      }
    } catch (error) {
      errorDeleteExcel();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img
          className="w-full h-full object-cover opacity-30"
          src="bg-anaekran.jpg"
          alt="background"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 space-y-6">
        {/* Search Bar and Add Folder */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-2xl mx-auto">
          <div className="relative w-full sm:w-2/3">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Klasör veya dosya arayın..."
              className="pl-10 pr-4 w-full"
            />
            <img
              src="search.svg"
              alt="ara"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            />
          </div>
          <AddFolder />
        </div>

        {/* Folders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto">
          {filteredFolders?.map((folder, index) => (
            <Card
              key={index}
              className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex flex-row justify-between items-center gap-2 bg-slate-100 p-3 rounded-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-800 truncate">
                      {folder.folder_name}
                    </h2>
                    <p className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(folder.created_at).toLocaleString()}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-slate-200 shrink-0"
                      >
                        <img
                          src="threeDots.svg"
                          alt="Menü"
                          className="h-5 w-5"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72">
                      <DropdownMenuItem
                        onClick={() => router.push("excel-upload")}
                        className="text-green-600 hover:bg-green-500 hover:text-white"
                      >
                        Dosya Yükle
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => setIsEditing(true)}
                        className="text-blue-600 hover:bg-blue-500 hover:text-white"
                      >
                        İsmi Düzenle
                      </DropdownMenuItem>

                      {isEditing && (
                        <div className="p-2 border-t">
                          <div className="flex flex-col gap-2">
                            <Input
                              value={folder.folder_name}
                              onChange={(e) => {
                                e.preventDefault();
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
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                                className="text-gray-600"
                              >
                                İptal
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  handleUpdateFolders(
                                    folder._id,
                                    folder.folder_name
                                  );
                                  setIsEditing(false);
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                              >
                                Kaydet
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      <DropdownMenuItem
                        onClick={() => handleDeleteFolders(folder._id)}
                        className="text-red-600 hover:bg-red-500 hover:text-white"
                      >
                        Klasörü Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {excels
                    .filter((excel) => excel.folder_id === folder._id)
                    .map((excel) => (
                      <li
                        key={excel._id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-3 hover:bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-blue-600 break-all">
                            {excel.file_name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(excel.created_at).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-white w-[80px]"
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
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-blue-500 hover:bg-blue-600 text-white w-[80px]"
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
                                  className="bg-red-500 hover:bg-red-600 text-white w-[80px]"
                                  onClick={() => handleDeleteExcel(excel._id)}
                                >
                                  Sil
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Excel Dosyanızı Silebilirsiniz
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
