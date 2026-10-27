"use client";

import { BarChart3, FolderOpen, GripVertical, MoreHorizontal, Pencil, Search, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { EmptyState, PageContainer, PageHeader } from "@/components/app/page";
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

  const totalExams = exams.length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Sınavlarım"
        title="Klasörler"
        description={
          loading
            ? "Yükleniyor…"
            : `${folders.length} klasör · ${totalExams} sınav. Klasörleri sürükleyerek sıralayabilirsiniz.`
        }
        actions={
          <>
            <Button variant="outline" onClick={() => router.push("/excel-upload")}>
              <Upload aria-hidden="true" />
              Sınav yükle
            </Button>
            <AddFolder onCreated={load} />
          </>
        }
      />

      <div className="relative max-w-md">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Klasör veya sınav arayın…"
          aria-label="Klasör veya sınav ara"
          className="h-11 bg-surface pl-9"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl border border-gray-200 bg-surface" />
          ))}
        </div>
      ) : folders.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Henüz klasör yok"
          description="Sınavlarınızı düzenlemek için bir klasör oluşturun, ardından Excel dosyanızı yükleyin."
          action={<AddFolder onCreated={load} />}
        />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="folders">
            {(provided: DroppableProvided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="grid gap-4 md:grid-cols-2">
                {visible.folders.map((folder, index) => {
                  const folderExams = visible.examsByFolder.get(folder.id) ?? [];
                  return (
                    <Draggable key={folder.id} draggableId={folder.id} index={index} isDragDisabled={Boolean(searchQuery)}>
                      {(dragProvided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        <section
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          style={dragProvided.draggableProps.style}
                          className={`flex flex-col rounded-xl border bg-surface transition-colors ${
                            snapshot.isDragging ? "border-blue-500 shadow-lg" : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
                            <span
                              {...dragProvided.dragHandleProps}
                              aria-label="Klasörü sürükleyerek taşı"
                              className="cursor-grab text-gray-400 hover:text-gray-700 active:cursor-grabbing"
                            >
                              <GripVertical aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <FolderOpen aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <h2 className="truncate text-base font-semibold text-gray-900">{folder.name}</h2>
                              <p className="text-xs text-gray-500">
                                {folder._count.exams} sınav · {new Date(folder.createdAt).toLocaleDateString("tr")}
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label={`${folder.name} klasörü işlemleri`}>
                                  <MoreHorizontal aria-hidden="true" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={() => router.push("/excel-upload")}>
                                  <Upload aria-hidden="true" className="h-4 w-4" />
                                  Sınav yükle
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingFolder(folder);
                                    setEditingName(folder.name);
                                  }}
                                >
                                  <Pencil aria-hidden="true" className="h-4 w-4" />
                                  Adını değiştir
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteFolder(folder)} className="text-red-600">
                                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                                  Klasörü sil
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {folderExams.length === 0 ? (
                            <p className="px-4 py-6 text-sm text-gray-500">Bu klasörde henüz sınav yok.</p>
                          ) : (
                            <ul className="divide-y divide-gray-200">
                              {folderExams.map((exam) => (
                                <li key={exam.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
                                  <button
                                    type="button"
                                    onClick={() => router.push(`/excel-reports?exam=${exam.id}`)}
                                    className="min-w-0 flex-1 text-left"
                                  >
                                    <span className="block truncate font-medium text-gray-900 hover:text-blue-700">{exam.name}</span>
                                    <span className="mt-0.5 block text-xs text-gray-500">
                                      {exam.studentCount} öğrenci · {exam.questionCount} madde ·{" "}
                                      {new Date(exam.createdAt).toLocaleDateString("tr")}
                                    </span>
                                  </button>
                                  {exam.stat && (
                                    <dl className="flex gap-4 text-right text-xs">
                                      <div>
                                        <dt className="text-gray-500">Ortalama</dt>
                                        <dd className="font-semibold tabular-nums text-gray-900">{exam.stat.mean.toFixed(1)}</dd>
                                      </div>
                                      <div>
                                        <dt className="text-gray-500">KR-20</dt>
                                        <dd className="font-semibold tabular-nums text-gray-900">
                                          {exam.stat.kr20 === null ? "—" : exam.stat.kr20.toFixed(2)}
                                        </dd>
                                      </div>
                                    </dl>
                                  )}
                                  <div className="flex gap-1.5">
                                    <Button
                                      size="sm"
                                      className="bg-blue-600 text-white hover:bg-blue-700"
                                      onClick={() => router.push(`/excel-reports?exam=${exam.id}`)}
                                    >
                                      <BarChart3 aria-hidden="true" />
                                      Rapor
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      aria-label={`${exam.name} sınavını düzenle`}
                                      onClick={() => router.push(`/excel-update?exam=${exam.id}`)}
                                    >
                                      <Pencil aria-hidden="true" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      aria-label={`${exam.name} sınavını sil`}
                                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                      onClick={() => handleDeleteExam(exam)}
                                    >
                                      <Trash2 aria-hidden="true" />
                                    </Button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <Dialog open={editingFolder !== null} onOpenChange={(open) => !open && setEditingFolder(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Klasör adını değiştir</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label htmlFor="folder-name" className="text-sm font-medium text-gray-700">
              Yeni ad
            </label>
            <Input
              id="folder-name"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
              }}
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingFolder(null)}>
              İptal
            </Button>
            <Button onClick={handleRename} disabled={!editingName.trim()}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastContainer position="bottom-right" />
    </PageContainer>
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
