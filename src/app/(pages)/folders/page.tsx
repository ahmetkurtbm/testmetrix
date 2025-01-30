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
import { ComboboxDemo } from "@/components/ui/comboboxForFolder";
import Cookies from "js-cookie";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface File {
  id: number;
  folder_name: string;
  file_name: string;
  created_at: string;
}

interface FolderProps {
  folder_name: string;
  files: File[];
}

interface FolderName {
  value: string;
  label: string;
}

export default function Home() {
  const router = useRouter();

  const [folders, setFolders] = useState<FolderProps[]>([]);
  const [folderNames, setFolderNames] = useState<FolderName[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!Cookies.get("token")) {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    async function fetchFolders() {
      try {
        const response = await fetch("http://localhost:5000/folders", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data: File[] = await response.json();

        interface FolderName {
          value: string;
          label: string;
        }

        const uniqueFolderNames: FolderName[] = Array.from(
          new Map(
            data.map((item) => [
              item.folder_name,
              { value: item.folder_name, label: item.folder_name },
            ])
          ).values()
        );

        setFolderNames(uniqueFolderNames);

        const groupedFolders: FolderProps[] = data.reduce((acc, file) => {
          const folderIndex = acc.findIndex(
            (folder) => folder.folder_name === file.folder_name
          );

          if (folderIndex === -1) {
            acc.push({ folder_name: file.folder_name, files: [file] });
          } else {
            acc[folderIndex].files.push(file);
          }

          return acc;
        }, [] as FolderProps[]);

        setFolders(groupedFolders);
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    }

    fetchFolders();
  }, []);

  const handleDelete = async (fileId: any) => {
    try {
      const response = await fetch("http://localhost:5000/excel-delete", {
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
    router.push(`/excel-update?file-id=${encodeURIComponent(fileId)}`);
  };

  const handleRaports = async (fileId: any) => {
    router.push(`/excel-reports?file-id=${encodeURIComponent(fileId)}`);
  };

  return (
    <div>
      {folders.map((folder) => (
        <Card key={folder.folder_name} className="mb-4 m-3 border-black">
          <CardHeader>
            <div className="flex w-full justify-between items-center text-center gap-1 bg-slate-300 p-1 rounded-md">
              <h2 className="text-xl font-semibold bg-gray-400 rounded-md py-1 px-2">
                {folder.folder_name}
              </h2>
              <p className="text-sm text-gray-500 ml-auto">
                {new Date(folder.files[0].created_at).toLocaleString()}
              </p>
              {/* <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      <img src="threeDots.svg" alt="Ayarlar" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="p-2 bg-white shadow-md rounded-md flex flex-col gap-1">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={folder.folder_name}
                          onChange={(e) => console.log(e.target.value)}
                          className="h-8 text-sm w-[10rem]"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            //onRename(folder.id, folderName);
                            setIsEditing(false);
                          }}
                        >
                          Kaydet
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => setIsEditing(true)}>
                        İsmi Düzenle
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      //onClick={() => onDelete(folder.id)}
                    >
                      Klasörü Sil
                    </Button>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider> */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <img src="threeDots.svg" alt="Menü" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="p-2 w-48">
                  {/* İsim Değiştirme Alanı */}
                  {isEditing ? (
                    <div className="flex items-center gap-2 p-2">
                      <Input
                        value={folder.folder_name}
                        onChange={(e) => console.log(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          //onRename(folder.id, folderName);
                          setIsEditing(false);
                        }}
                      >
                        Kaydet
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation(); // Menü kapanmasını engeller
                        setIsEditing(true);
                      }}
                    >
                      İsmi Düzenle
                    </div>
                  )}
                  <DropdownMenuItem
                    //onClick={() => onDelete(folder.id)}
                    className="text-red-500"
                  >
                    Klasörü Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 m-3">
              {folder.files.map((file) => (
                <li key={file.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-blue-700 ">
                      {file.file_name}
                    </span>
                    <span className="text-sm text-gray-400 ml-2">
                      {new Date(file.created_at).toLocaleString()}
                    </span>
                  </div>
                  {/* content="Edit File" delay={500} */}
                  <TooltipProvider>
                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-blue-500 text-white"
                            onClick={() => handleUpdate(file.id)}
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
                            onClick={() => handleRaports(file.id)}
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
                            folderNames={folderNames}
                            id={file.id}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          Excel Raporunuzu İstediğiniz Klasöre Taşıyabilirsiniz
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-500 text-white"
                            onClick={() => handleDelete(file.id)}
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
