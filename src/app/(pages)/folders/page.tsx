"use client";

import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { apiDelete, apiGet, apiPatch, apiPut } from "@/lib/api-client";
import type { ExamSummary, FolderSummary } from "@/features/exams/types";

const notifyError = (error: unknown, fallback: string) =>
  toast.error(error instanceof Error ? error.message : fallback, {
    theme: "dark",
  });

export default function Folders() {
  const router = useRouter();

  const [folders, setFolders] = useState<FolderSummary[]>([]);
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingFolder, setEditingFolder] = useState<FolderSummary | null>(null);
  const [editingName, setEditingName] = useState("");

  // Oturum kontrolü YOK: middleware bu sayfaya oturumsuz erişimi kesiyor.
  const load = useCallback(async () => {
    try {
      const [folderList, examList] = await Promise.all([
        apiGet<FolderSummary[]>("/api/folders"),
        apiGet<ExamSummary[]>("/api/exams"),
      ]);
      setFolders(folderList);
      setExams(examList);
    } catch (error) {
      notifyError(error, "Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * Arama hem klasör hem sınav adında çalışır: eşleşen sınavı olan klasör de
   * listede kalır. Eskiden iki ayrı `filtered*` state'i `useEffect` ile
   * senkron tutuluyordu; türetilmiş veri artık `useMemo` ile hesaplanıyor.
   */
  const visible = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("tr");
    if (!query) return { folders, examsByFolder: groupBy(exams) };

    const matchingExams = exams.filter((exam) =>
      exam.name.toLocaleLowerCase("tr").includes(query)
    );
    const folderIdsWithMatch = new Set(matchingExams.map((e) => e.folderId));

    const matchingFolders = folders.filter(
      (folder) =>
        folder.name.toLocaleLowerCase("tr").includes(query) ||
        folderIdsWithMatch.has(folder.id)
    );

    return {
      folders: matchingFolders,
      examsByFolder: groupBy(
        exams.filter(
          (exam) =>
            matchingExams.includes(exam) ||
            matchingFolders.some(
              (f) => f.id === exam.folderId && f.name.toLocaleLowerCase("tr").includes(query)
            )
        )
      ),
    };
  }, [folders, exams, searchQuery]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || searchQuery) return;

    const reordered = [...folders];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const previous = folders;
    setFolders(reordered); // iyimser güncelleme

    try {
      await apiPut("/api/folders/order", {
        folderIds: reordered.map((f) => f.id),
      });
    } catch (error) {
      setFolders(previous); // başarısızsa geri al
      notifyError(error, "Sıralama güncellenemedi.");
    }
  };

  const handleRename = async () => {
    if (!editingFolder || !editingName.trim()) return;
    try {
      await apiPatch(`/api/folders/${editingFolder.id}`, {
        name: editingName.trim(),
      });
      toast.success("Klasör ismi güncellendi.", { theme: "dark" });
      setEditingFolder(null);
      load();
    } catch (error) {
      notifyError(error, "Klasör ismi güncellenemedi.");
    }
  };

  const handleDeleteFolder = async (folder: FolderSummary) => {
    const count = folder._count.exams;
    const message = count
      ? `"${folder.name}" klasörü ve içindeki ${count} sınav kalıcı olarak silinecek. Emin misiniz?`
      : `"${folder.name}" klasörü silinecek. Emin misiniz?`;
    if (!confirm(message)) return;

    try {
      await apiDelete(`/api/folders/${folder.id}`);
      toast.success("Klasör silindi.", { theme: "dark" });
      load();
    } catch (error) {
      notifyError(error, "Klasör silinemedi.");
    }
  };

  const handleDeleteExam = async (exam: ExamSummary) => {
    if (!confirm(`"${exam.name}" sınavı kalıcı olarak silinecek. Emin misiniz?`)) {
      return;
    }
    try {
      await apiDelete(`/api/exams/${exam.id}`);
      toast.success("Sınav silindi.", { theme: "dark" });
      load();
    } catch (error) {
      notifyError(error, "Sınav silinemedi.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 space-y-6">
        <div className="flex flex-row justify-center items-center gap-4 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Klasör veya sınav arayın..."
              className="pl-10 pr-4 w-full"
            />
            <img
              src="/search.svg"
              alt=""
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            />
          </div>
          <div className="shrink-0">
            <AddFolder onCreated={load} />
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Yükleniyor...</p>
        ) : folders.length === 0 ? (
          <div className="max-w-md mx-auto bg-white/95 p-6 rounded-2xl shadow text-center">
            <p className="text-lg font-semibold text-gray-700">
              📁 Henüz klasör yok
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Başlamak için yukarıdan bir klasör ekleyin.
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="folders">
              {(provided: DroppableProvided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto"
                >
                  {visible.folders.map((folder, index) => (
                    <Draggable
                      key={folder.id}
                      draggableId={folder.id}
                      index={index}
                      isDragDisabled={Boolean(searchQuery)}
                    >
                      {(
                        dragProvided: DraggableProvided,
                        snapshot: DraggableStateSnapshot
                      ) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          className={snapshot.isDragging ? "opacity-50" : ""}
                          style={dragProvided.draggableProps.style}
                        >
                          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader>
                              <div className="flex flex-row justify-between items-center gap-2 bg-slate-100 p-3 rounded-lg">
                                <div className="flex items-center gap-2 min-w-0">
                                  <img
                                    src="/grab.svg"
                                    alt=""
                                    className="w-5 h-5 cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 transition-opacity shrink-0"
                                  />
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 min-w-0">
                                    <h2 className="text-lg font-semibold text-gray-800 truncate">
                                      {folder.name}
                                    </h2>
                                    <p className="text-xs text-gray-500 whitespace-nowrap">
                                      {new Date(folder.createdAt).toLocaleString("tr")}
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
                                        src="/threeDots.svg"
                                        alt="Menü"
                                        className="h-5 w-5"
                                      />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-64">
                                    <DropdownMenuItem
                                      onClick={() => router.push("/excel-upload")}
                                      className="text-green-600"
                                    >
                                      Dosya Yükle
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditingFolder(folder);
                                        setEditingName(folder.name);
                                      }}
                                      className="text-blue-600"
                                    >
                                      İsmi Düzenle
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteFolder(folder)}
                                      className="text-red-600"
                                    >
                                      Klasörü Sil
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardHeader>

                            <CardContent>
                              <ul className="space-y-3">
                                {(visible.examsByFolder.get(folder.id) ?? []).map(
                                  (exam) => (
                                    <li
                                      key={exam.id}
                                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-3 hover:bg-gray-50 rounded-lg border border-gray-100"
                                    >
                                      <div className="flex flex-col gap-1 min-w-0">
                                        <span className="font-medium text-blue-600 break-all">
                                          {exam.name}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                          {exam.studentCount} öğrenci ·{" "}
                                          {exam.questionCount} madde ·{" "}
                                          {new Date(exam.createdAt).toLocaleString("tr")}
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
                                                  router.push(
                                                    `/excel-reports?exam=${exam.id}`
                                                  )
                                                }
                                              >
                                                Raporlar
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              İstatistikleri ve grafikleri görün
                                            </TooltipContent>
                                          </Tooltip>

                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-blue-500 hover:bg-blue-600 text-white w-[80px]"
                                                onClick={() =>
                                                  router.push(
                                                    `/excel-update?exam=${exam.id}`
                                                  )
                                                }
                                              >
                                                Düzenle
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              Cevapları düzenleyin
                                            </TooltipContent>
                                          </Tooltip>

                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-red-500 hover:bg-red-600 text-white w-[80px]"
                                                onClick={() => handleDeleteExam(exam)}
                                              >
                                                Sil
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Sınavı silin</TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                    </li>
                                  )
                                )}
                                {(visible.examsByFolder.get(folder.id) ?? []).length ===
                                  0 && (
                                  <li className="text-sm text-gray-400 px-3 py-2">
                                    Bu klasörde sınav yok.
                                  </li>
                                )}
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
        )}
      </div>

      <Dialog
        open={editingFolder !== null}
        onOpenChange={(open) => !open && setEditingFolder(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center">
              Klasör İsmini Düzenle
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <label className="text-sm font-medium text-gray-700">Yeni isim</label>
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
              }}
              placeholder="Yeni klasör ismini girin..."
              autoFocus
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setEditingFolder(null)}>
              İptal
            </Button>
            <Button onClick={handleRename} disabled={!editingName.trim()}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}

function groupBy(exams: ExamSummary[]): Map<string, ExamSummary[]> {
  const map = new Map<string, ExamSummary[]>();
  for (const exam of exams) {
    const list = map.get(exam.folderId);
    if (list) list.push(exam);
    else map.set(exam.folderId, [exam]);
  }
  return map;
}
