"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useState, useEffect } from "react";

// Verilerin tiplerini tanımlayalım
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

export default function Home() {
  const [folders, setFolders] = useState<FolderProps[]>([]);

  useEffect(() => {
    async function fetchFolders() {
      try {
        console.log("geldim");
        const response = await fetch("http://localhost:5000/folders", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data: File[] = await response.json();

        console.log(data);

        // Folder'ları gruplayalım
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
                            onClick={() =>
                              alert(`Edit file: ${file.file_name}`)
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
                            onClick={() =>
                              alert(`Edit file: ${file.file_name}`)
                            }
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
                            onClick={() =>
                              alert(`Edit file: ${file.file_name}`)
                            }
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
