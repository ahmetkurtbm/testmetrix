"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import type {
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableProvided,
} from "@hello-pangea/dnd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import AddFolder from "@/app/(components)/AddFolder";
import { apiDelete, apiGet, apiPatch, apiPut } from "@/lib/api-client";
import { fmt, fmtDate } from "@/lib/format";
import { interpretReliability } from "@/features/reports/quality";
import type { ExamSummary, FolderSummary } from "@/features/exams/types";
import {
  Card,
  EmptyState,
  GhostButton,
  PageHeader,
  PageShell,
  StatTile,
  TableShell,
  Th,
} from "@/features/ui/primitives";

const notifyError = (error: unknown, fallback: string) =>
  toast.error(error instanceof Error ? error.message : fallback, { theme: "dark" });

type View = "grid" | "list";

export default function Folders() {
  const router = useRouter();

  const [folders, setFolders] = useState<FolderSummary[]>([]);
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("grid");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FolderSummary | null>(null);
  const [editingName, setEditingName] = useState("");

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

  /** Özet sayılar — önbellekteki istatistiklerden, ek sorgu olmadan. */
  const totals = useMemo(() => {
    const students = exams.reduce((sum, e) => sum + e.studentCount, 0);
    const withKr20 = exams.filter((e) => e.stat?.kr20 != null);
    const avgKr20 = withKr20.length
      ? withKr20.reduce((sum, e) => sum + (e.stat!.kr20 as number), 0) / withKr20.length
      : null;
    return { students, avgKr20, measured: withKr20.length };
  }, [exams]);

  const search = query.trim().toLocaleLowerCase("tr");

  const examsByFolder = useMemo(() => {
    const map = new Map<string, ExamSummary[]>();
    for (const exam of exams) {
      if (search && !exam.name.toLocaleLowerCase("tr").includes(search)) {
        // Klasör adı eşleşiyorsa sınavlar yine görünsün
        const folder = folders.find((f) => f.id === exam.folderId);
        if (!folder?.name.toLocaleLowerCase("tr").includes(search)) continue;
      }
      const list = map.get(exam.folderId);
      if (list) list.push(exam);
      else map.set(exam.folderId, [exam]);
    }
    return map;
  }, [exams, folders, search]);

  const visibleFolders = useMemo(() => {
    if (!search) return folders;
    return folders.filter(
      (folder) =>
        folder.name.toLocaleLowerCase("tr").includes(search) ||
        (examsByFolder.get(folder.id)?.length ?? 0) > 0
    );
  }, [folders, examsByFolder, search]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || search) return;
    const reordered = [...folders];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const previous = folders;
    setFolders(reordered);
    try {
      await apiPut("/api/folders/order", { folderIds: reordered.map((f) => f.id) });
    } catch (error) {
      setFolders(previous);
      notifyError(error, "Sıralama güncellenemedi.");
    }
  };

  const handleRename = async () => {
    if (!editing || !editingName.trim()) return;
    try {
      await apiPatch(`/api/folders/${editing.id}`, { name: editingName.trim() });
      toast.success("Klasör ismi güncellendi.", { theme: "dark" });
      setEditing(null);
      load();
    } catch (error) {
      notifyError(error, "Güncellenemedi.");
    }
  };

  const handleDeleteFolder = async (folder: FolderSummary) => {
    const count = folder._count.exams;
    if (
      !confirm(
        count
          ? `"${folder.name}" ve içindeki ${count} sınav kalıcı olarak silinecek. Emin misiniz?`
          : `"${folder.name}" silinecek. Emin misiniz?`
      )
    )
      return;
    try {
      await apiDelete(`/api/folders/${folder.id}`);
      toast.success("Klasör silindi.", { theme: "dark" });
      load();
    } catch (error) {
      notifyError(error, "Silinemedi.");
    }
  };

  const handleDeleteExam = async (exam: ExamSummary) => {
    if (!confirm(`"${exam.name}" kalıcı olarak silinecek. Emin misiniz?`)) return;
    try {
      await apiDelete(`/api/exams/${exam.id}`);
      toast.success("Sınav silindi.", { theme: "dark" });
      load();
    } catch (error) {
      notifyError(error, "Silinemedi.");
    }
  };

  const examRow = (exam: ExamSummary) => {
    const kr20 = exam.stat?.kr20 ?? null;
    return (
      <div
        key={exam.id}
        className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-black/5 dark:border-white/10 hover:bg-[var(--viz-surface)] transition-colors"
      >
        <div className="min-w-0">
          <div className="text-sm font-medium text-[var(--viz-text)] truncate">
            {exam.name}
          </div>
          <div
            className="mt-0.5 text-xs text-[var(--viz-text-secondary)]"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {exam.studentCount} öğrenci · {exam.questionCount} madde · ort.{" "}
            {fmt(exam.stat?.mean, 1)} · KR-20 {fmt(kr20)}
            {kr20 !== null && (
              <span className="text-[var(--viz-text-muted)]">
                {" "}
                ({interpretReliability(kr20).label.toLocaleLowerCase("tr")})
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1.5">
          <GhostButton href={`/excel-reports?exam=${exam.id}`}>Rapor</GhostButton>
          <GhostButton href={`/excel-update?exam=${exam.id}`}>Düzenle</GhostButton>
          <GhostButton onClick={() => handleDeleteExam(exam)}>Sil</GhostButton>
        </div>
      </div>
    );
  };

  return (
    <PageShell>
      <PageHeader
        title="Klasörler"
        meta={
          loading
            ? "Yükleniyor..."
            : `${folders.length} klasör · ${exams.length} sınav · ${totals.students} öğrenci kaydı`
        }
        actions={
          <>
            <GhostButton
              onClick={() => setView((v) => (v === "grid" ? "list" : "grid"))}
            >
              {view === "grid" ? "Liste görünümü" : "Kart görünümü"}
            </GhostButton>
            <AddFolder onCreated={load} />
          </>
        }
      />

      {!loading && exams.length > 0 && (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatTile label="Sınav" value={String(exams.length)} />
          <StatTile label="Öğrenci kaydı" value={String(totals.students)} />
          <StatTile
            label="Ortalama KR-20"
            value={fmt(totals.avgKr20)}
            hint={`${totals.measured} sınavda hesaplandı`}
          />
          <StatTile label="Klasör" value={String(folders.length)} />
        </div>
      )}

      <Card>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Klasör veya sınav arayın..."
          className="max-w-md"
        />

        {loading ? (
          <p className="mt-6 text-sm text-[var(--viz-text-secondary)]">Yükleniyor...</p>
        ) : folders.length === 0 ? (
          <EmptyState
            icon="📁"
            title="Henüz klasör yok"
            body="Sınavlarınızı düzenlemek için önce bir klasör oluşturun."
          />
        ) : view === "list" ? (
          <div className="mt-4">
            <TableShell>
              <thead className="bg-[var(--viz-surface)] text-[var(--viz-text-secondary)]">
                <tr>
                  <Th>Sınav</Th>
                  <Th>Klasör</Th>
                  <Th align="right">Öğrenci</Th>
                  <Th align="right">Madde</Th>
                  <Th align="right">Ortalama</Th>
                  <Th align="right">KR-20</Th>
                  <Th align="right">Tarih</Th>
                  <Th align="right">İşlem</Th>
                </tr>
              </thead>
              <tbody>
                {exams
                  .filter((e) => (examsByFolder.get(e.folderId) ?? []).includes(e))
                  .map((exam) => (
                    <tr
                      key={exam.id}
                      className="border-t border-black/5 dark:border-white/10 hover:bg-[var(--viz-surface)]"
                    >
                      <td className="px-3 py-2 text-[var(--viz-text)]">{exam.name}</td>
                      <td className="px-3 py-2 text-[var(--viz-text-secondary)]">
                        {folders.find((f) => f.id === exam.folderId)?.name ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right">{exam.studentCount}</td>
                      <td className="px-3 py-2 text-right">{exam.questionCount}</td>
                      <td className="px-3 py-2 text-right">{fmt(exam.stat?.mean, 1)}</td>
                      <td className="px-3 py-2 text-right">{fmt(exam.stat?.kr20)}</td>
                      <td className="px-3 py-2 text-right text-[var(--viz-text-secondary)]">
                        {fmtDate(exam.createdAt)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => router.push(`/excel-reports?exam=${exam.id}`)}
                          className="text-[var(--viz-series)] hover:underline"
                        >
                          Rapor
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </TableShell>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="folders">
              {(provided: DroppableProvided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="mt-4 grid gap-3 lg:grid-cols-2"
                >
                  {visibleFolders.map((folder, index) => (
                    <Draggable
                      key={folder.id}
                      draggableId={folder.id}
                      index={index}
                      isDragDisabled={Boolean(search)}
                    >
                      {(
                        drag: DraggableProvided,
                        snapshot: DraggableStateSnapshot
                      ) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          style={drag.draggableProps.style}
                          className={`rounded-lg border border-black/5 dark:border-white/10 bg-[var(--viz-surface)] p-4 ${
                            snapshot.isDragging ? "opacity-60" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="min-w-0">
                              <h3 className="text-sm font-medium text-[var(--viz-text)] truncate">
                                {folder.name}
                              </h3>
                              <p className="text-xs text-[var(--viz-text-secondary)]">
                                {folder._count.exams} sınav ·{" "}
                                {fmtDate(folder.createdAt)}
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="px-2 text-[var(--viz-text-muted)] hover:text-[var(--viz-text)]">
                                ⋯
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => router.push("/excel-upload")}
                                >
                                  Dosya yükle
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditing(folder);
                                    setEditingName(folder.name);
                                  }}
                                >
                                  İsmi düzenle
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteFolder(folder)}
                                  className="text-red-600"
                                >
                                  Klasörü sil
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="space-y-2">
                            {(examsByFolder.get(folder.id) ?? []).map(examRow)}
                            {(examsByFolder.get(folder.id) ?? []).length === 0 && (
                              <p className="text-xs text-[var(--viz-text-muted)] px-1 py-2">
                                Bu klasörde sınav yok.
                              </p>
                            )}
                          </div>
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
      </Card>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-base">Klasör ismini düzenle</DialogTitle>
          </DialogHeader>
          <Input
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
          />
          <DialogFooter>
            <GhostButton onClick={() => setEditing(null)}>İptal</GhostButton>
            <button
              onClick={handleRename}
              disabled={!editingName.trim()}
              className="px-3 py-2 text-sm rounded-md bg-[var(--viz-series)] text-white disabled:opacity-50"
            >
              Kaydet
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastContainer position="bottom-right" theme="dark" />
    </PageShell>
  );
}
