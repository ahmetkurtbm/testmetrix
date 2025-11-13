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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import AddFolder from "@/app/(components)/AddFolder";
import { ToastContainer, toast } from "react-toastify";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import type {
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableProvided,
} from "@hello-pangea/dnd";
import { getCookie } from "@/lib/my-utils";

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

  const successReorderFolder = () =>
    toast.success("Klasör Sıralaması Güncellendi!", {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const errorReorderFolder = () =>
    toast.error("Klasör Sıralaması Güncellenemedi!", {
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
  const [isEditingModal, setIsEditingModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderNames | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [filteredExcels, setFilteredExcels] = useState<File[]>([]);
  const [filteredFolders, setFilteredFolders] = useState<FolderNames[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>("");

  // Token Kontrolü // get folder // get excel
  useEffect(() => {
    async function fetchFolders() {
      try {
        const token = await getCookie();
        if (!token) {
          return;
        }
        const response = await fetch(`${BACKEND_URL}/folders`, {
          method: "GET",
          headers: {
          "Content-Type": "application/json", Authorization: token,
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
        const token = await getCookie();
        if (!token) {
          return;
        }
        const response = await fetch(`${BACKEND_URL}/excels`, {
          method: "GET",
          headers: {
          "Content-Type": "application/json", Authorization: token,
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
      const token = await getCookie();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/user-authentication`, {
          method: "GET",
          headers: {
            Authorization: token,
          },
          credentials: "include",
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
      const token = await getCookie();
      if (!token) {
        return;
      }
      const response = await fetch(`${BACKEND_URL}/update-folder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", Authorization: token,
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
        setIsEditingModal(false);
        setEditingFolder(null);
        setEditingFolderName("");
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
      const token = await getCookie();
      if (!token) {
        return;
      }
      const response = await fetch(`${BACKEND_URL}/delete-folder`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json", Authorization: token,
        },
        body: JSON.stringify({ id: folderId }),
        credentials: "include",
      });

      if (response.ok) {
        successDeleteFolder();
        setFolders((prevFolders) =>
          prevFolders.filter((folder) => folder._id !== folderId)
        );
      } else {
        console.error("Silme başarısız");
      }
    } catch (error) {
      console.error("Hata oluştu:", error);
    }
  };

  const handleDeleteExcel = async (fileId: any) => {
    try {
      const token = await getCookie();
      if (!token) {
        return;
      }
      const response = await fetch(`${BACKEND_URL}/excel-delete`, {
        method: "DELETE",
        body: JSON.stringify({ fileId }),
        headers: {
          "Content-Type": "application/json", Authorization: token,
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(filteredFolders);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFilteredFolders(items);
    setFolders(items);
    saveNewOrder(items);
  };

  const saveNewOrder = async (newOrder: FolderNames[]) => {
    try {
      const token = await getCookie();
      if (!token) {
        return;
      }
      const response = await fetch(`${BACKEND_URL}/update-folder-order`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", Authorization: token,
        },
        body: JSON.stringify({ folders: newOrder }),
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Failed to save folder order");
      }
    } catch (error) {
      console.error("Error saving folder order:", error);
    }
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
        <div className="flex flex-row justify-center items-center gap-4 max-w-2xl mx-auto">
          <div className="relative flex-1">
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
          <div className="shrink-0">
            <AddFolder />
          </div>
        </div>
        {/* Updated Folders Grid with Drag and Drop */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="folders" isDropDisabled={false}>
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto"
              >
                {filteredFolders?.map((folder, index) => (
                  <Draggable
                    key={folder._id}
                    draggableId={folder._id}
                    index={index}
                  >
                    {(
                      dragProvided: DraggableProvided,
                      snapshot: DraggableStateSnapshot
                    ) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        className={`${snapshot.isDragging ? "opacity-50" : ""}`}
                        style={dragProvided.draggableProps.style}
                      >
                        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex flex-row justify-between items-center gap-2 bg-slate-100 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <img
                                  src="/grab.svg"
                                  alt="Sırala"
                                  className="w-5 h-5 cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 transition-opacity"
                                />
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 min-w-0">
                                  <h2 className="text-lg font-semibold text-gray-800 truncate">
                                    {folder.folder_name}
                                  </h2>
                                  <p className="text-xs text-gray-500 whitespace-nowrap">
                                    {new Date(
                                      folder.created_at
                                    ).toLocaleString()}
                                  </p>
                                </div>
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
                                <DropdownMenuContent
                                  align="end"
                                  className="w-72"
                                >
                                  <DropdownMenuItem
                                    onClick={() => router.push("excel-upload")}
                                    className="text-green-600 hover:bg-green-500 hover:text-white"
                                  >
                                    Dosya Yükle
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingFolder(folder);
                                      setEditingFolderName(folder.folder_name);
                                      setIsEditingModal(true);
                                    }}
                                    className="text-blue-600 hover:bg-blue-500 hover:text-white"
                                  >
                                    İsmi Düzenle
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteFolders(folder._id)
                                    }
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
                                .filter(
                                  (excel) => excel.folder_id === folder._id
                                )
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
                                        {new Date(
                                          excel.created_at
                                        ).toLocaleString()}
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
                                              onClick={() =>
                                                handleRaports(excel._id)
                                              }
                                            >
                                              Raporlar
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            Excel Dosyanızın Raporlarını ve
                                            Grafiklerini Görebilirsiniz
                                          </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="bg-blue-500 hover:bg-blue-600 text-white w-[80px]"
                                              onClick={() =>
                                                handleUpdate(excel._id)
                                              }
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
                                              onClick={() =>
                                                handleDeleteExcel(excel._id)
                                              }
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
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Klasör İsmi Düzenleme Modal */}
      <Dialog open={isEditingModal} onOpenChange={setIsEditingModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center">
              Klasör İsmini Düzenle
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Mevcut İsim:
              </label>
              <div className="p-2 bg-gray-100 rounded text-gray-600 text-sm">
                {editingFolder?.folder_name}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Yeni İsim:
              </label>
              <Input
                value={editingFolderName}
                onChange={(e) => setEditingFolderName(e.target.value)}
                placeholder="Yeni klasör ismini girin..."
                className="w-full"
                autoFocus
              />
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditingModal(false);
                setEditingFolder(null);
                setEditingFolderName("");
              }}
            >
              İptal
            </Button>
            <Button
              onClick={() => {
                if (editingFolder && editingFolderName.trim()) {
                  handleUpdateFolders(editingFolder._id, editingFolderName.trim());
                }
              }}
              disabled={!editingFolderName.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
