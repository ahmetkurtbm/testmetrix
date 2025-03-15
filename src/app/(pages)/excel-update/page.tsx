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
      try {
        const response = await fetch(`${BACKEND_URL}/user-authentication`, {
          method: "GET",
          credentials: "include", // Çerezleri otomatik ekler
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
          const response = await fetch(`${BACKEND_URL}/excel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
        const response = await fetch(`${BACKEND_URL}/excel-update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
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
    <div className="p-4 flex flex-col gap-4">
      <img
        className="absolute inset-0 w-full h-full object-cover opacity-100 z-[-1]"
        src="bg-anaekran2.jpg"
      />
      <div className="w-full flex justify-between bg-slate-300 p-3 rounded-md">
        <div>
          <h1 className="text-2xl font-semibold mb-4">{data?.file_name}</h1>
          <h4 className="text-sm font-semibold mb-4 text-gray-400">
            {data?.created_at}
          </h4>
        </div>
        <div className="flex gap-3 ">
          <ComboboxDemo
            folderId={folderId}
            setFolderId={setFolderId}
          ></ComboboxDemo>
          <div>
            <Input value={fileName} onChange={handleFileNameChange} />
          </div>
          <Button onClick={handleUpdate}>Değişiklikleri Kaydet</Button>
        </div>
      </div>
      <div className="overflow-x-auto max-w-full max-h-[36rem] overflow-y-auto bg-slate-300 p-4 rounded-md">
        <table className="border-collapse border border-gray-200 w-full">
          <thead>
            <tr className="bg-gray-100">
              {data?.file_data[0]?.map((header, index) => (
                <th
                  key={index}
                  className="p-4 text-left font-medium text-gray-700 text-xs"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedValues.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="p-4">
                    {cellIndex === 0 ? (
                      <span className="text-gray-600 text-xs">{cell}</span>
                    ) : (
                      <Select
                        value={cell || ""}
                        onValueChange={(newValue) =>
                          handleSelectChange(rowIndex, cellIndex, newValue)
                        }
                      >
                        <SelectTrigger className="w-full p-2 border border-gray-300 rounded-md text-xs">
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          {["A", "B", "C", "D", "E", "Boş"].map(
                            (option, index) => (
                              <SelectItem
                                className="text-xs"
                                key={index}
                                value={option}
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
};

export default ExcelUpdate;
