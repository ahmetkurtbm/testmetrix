"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback, useEffect, useState } from "react";
import { ComboboxDemo } from "@/components/ui/comboboxForFolder";
import { useRouter } from "next/navigation";
import { produce } from "immer";
import { unstable_batchedUpdates } from "react-dom";
import { ToastContainer, toast } from "react-toastify";
import { getCookie } from "@/lib/my-utils";

interface File {
  id: string;
  folder_id: string;
  file_name: string;
  created_at: string;
  file_data: string[][];
}

const ExcelUpdate = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();

  // Token Kontrolü
  useEffect(() => {
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
        }
      } catch (error) {
        console.error("Kimlik doğrulama hatası:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, []);

  const [data, setData] = useState<File | null>(null);
  const [selectedValues, setSelectedValues] = useState<string[][]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [folderId, setFolderId] = useState<string>();

  const success = () =>
    toast.success("Güncelleme Başarılı!", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const error = () =>
    toast.error(
      "Güncelleme Başarısız, Bir Hata Oluştu! Daha sonra tekrar deneyiniz.",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      }
    );

  const errorGetExcel = () =>
    toast.error(
      "Veri Çekme Başarısız, Bir Hata Oluştu! Daha sonra tekrar deneyiniz.",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      }
    );

  useEffect(() => {
    const getExcel = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const fileId = searchParams.get("file-id");

      if (fileId) {
        try {
          const token = await getCookie();
          if (!token) {
            return;
          }
          const response = await fetch(`${BACKEND_URL}/excel`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json", Authorization: token,
            },
            body: JSON.stringify({ fileId }),
            credentials: "include",
          });

          if (response.ok) {
            const fetchedData: File = await response.json();

            unstable_batchedUpdates(() => {
              setData(fetchedData);
              setFileName(fetchedData.file_name);
              setFolderId(fetchedData.folder_id);
              setSelectedValues(fetchedData.file_data.map((row) => [...row]));
              setCreatedAt(fetchedData.created_at);
            });
          } else {
            errorGetExcel();
            console.error("Failed to fetch data:", await response.json());
          }
        } catch (error) {
          errorGetExcel();
          console.error("Error fetching Excel data:", error);
        }
      }
    };

    getExcel();
  }, []);

  const handleFileNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFileName(e.target.value);
    },
    []
  );

  const handleSelectChange = (
    rowIndex: number,
    colIndex: number,
    newValue: string
  ) => {
    setSelectedValues((prevValues) =>
      produce(prevValues, (draft) => {
        draft[rowIndex][colIndex] = newValue;
      })
    );
  };

  const handleUpdate = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const fileId = searchParams.get("file-id");

    if (fileId) {
      try {
        const token = await getCookie();
        if (!token) {
          return;
        }
        const response = await fetch(`${BACKEND_URL}/excel-update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json", Authorization: token,
          },
          body: JSON.stringify({
            id: fileId,
            folder_id: folderId,
            file_name: fileName,
            file_data: selectedValues,
          }),
          credentials: "include",
        });

        if (response.ok) {
          success();
        } else {
          error();
          console.error("Update failed:", await response.text());
        }
      } catch (err) {
        error();
        console.error("Error Updating Excel:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-sm"></div>
        <img
          className="w-full h-full object-cover opacity-30"
          src="bg-anaekran.jpg"
          alt="background"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 space-y-6 max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold text-gray-800">
                {data?.file_name}
              </h1>
              <p className="text-sm text-gray-500">
                Oluşturulma: {new Date(data?.created_at || "").toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <ComboboxDemo folderId={folderId} setFolderId={setFolderId} />
              <div className="flex-1 sm:flex-none">
                <Input
                  value={fileName}
                  onChange={handleFileNameChange}
                  className="border-gray-200 focus:ring-blue-500"
                  placeholder="Dosya adı"
                />
              </div>
              <Button
                onClick={handleUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                Değişiklikleri Kaydet
              </Button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-16rem)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th
                    key="0"
                    className="p-4 text-left font-semibold text-gray-700 text-sm sticky top-0 bg-gray-50/95 backdrop-blur-sm"
                  >
                    {data?.file_data[0][0]}
                  </th>
                  {data?.file_data[0]?.slice(1).map((header, index) => (
                    <th
                      key={index + 1}
                      className="p-4 text-left font-semibold text-gray-700 text-sm sticky top-0 bg-gray-50/95 backdrop-blur-sm"
                    >
                      M {index + 1} : {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedValues.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-gray-100 hover:bg-gray-50/50"
                  >
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="p-4">
                        {cellIndex === 0 ? (
                          <span className="text-sm text-gray-600 font-medium">
                            {cell}
                          </span>
                        ) : (
                          <Select
                            value={cell || ""}
                            onValueChange={(newValue) =>
                              handleSelectChange(rowIndex, cellIndex, newValue)
                            }
                          >
                            <SelectTrigger className="w-32 p-2 text-sm border-gray-200 hover:border-gray-300 focus:ring-blue-500">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              {["A", "B", "C", "D", "E", "Boş"].map(
                                (option, index) => (
                                  <SelectItem
                                    key={index}
                                    value={option}
                                    className="text-sm"
                                  >
                                    {option}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
        theme="light"
      />
    </div>
  );
};

export default ExcelUpdate;
