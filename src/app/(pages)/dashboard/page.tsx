import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminId } from "@/lib/session";
import { fmtDate } from "@/lib/format";
import { UserActions } from "./UserActions";
import {
  Card,
  PageHeader,
  PageShell,
  SectionTitle,
  StatTile,
  TableShell,
  Th,
} from "@/features/ui/primitives";

/**
 * Yönetim ekranı.
 *
 * Yetki kontrolü SUNUCUDA ve ilk satırda. Eski sürüm hiçbir kontrol yapmıyor,
 * sabit `localhost:5000` adresine istek atıyordu; arkadaki uç nokta da rol
 * kontrolü yapmadığı için giriş yapmış herkes tüm kullanıcı listesini
 * çekebiliyordu.
 *
 * Yetkisize 403 değil 404 gösteriliyor: sayfanın varlığı bile sızmasın.
 */
export default async function DashboardPage() {
  let adminId: string;
  try {
    adminId = await requireAdminId();
  } catch {
    notFound();
  }

  const [users, examCount, studentSum] = await Promise.all([
    prisma.appUser.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        university: true,
        role: true,
        createdAt: true,
        _count: { select: { folders: true, exams: true } },
      },
    }),
    prisma.exam.count(),
    prisma.exam.aggregate({ _sum: { studentCount: true } }),
  ]);

  const admins = users.filter((u) => u.role === "ADMIN").length;

  return (
    <PageShell>
      <PageHeader
        title="Yönetim"
        meta="Kimlik doğrulama GateHub üzerinden yapılır; buradan yalnızca TestMetrix rolleri yönetilir."
      />

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatTile label="Kullanıcı" value={String(users.length)} />
        <StatTile label="Yönetici" value={String(admins)} />
        <StatTile label="Toplam sınav" value={String(examCount)} />
        <StatTile
          label="Öğrenci kaydı"
          value={String(studentSum._sum.studentCount ?? 0)}
        />
      </div>

      <Card>
        <SectionTitle
          title="Kullanıcılar"
          hint="Rolü değiştirebilir veya hesabı silebilirsiniz. Kendi yetkinizi kaldıramazsınız."
        />

        <TableShell>
          <thead className="bg-[var(--viz-surface)] text-[var(--viz-text-secondary)]">
            <tr>
              <Th>Ad</Th>
              <Th>E-posta</Th>
              <Th>Kurum</Th>
              <Th align="right">Klasör</Th>
              <Th align="right">Sınav</Th>
              <Th align="right">Kayıt</Th>
              <Th align="right">Rol / İşlem</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t border-black/5 dark:border-white/10 hover:bg-[var(--viz-surface)] transition-colors"
              >
                <td className="px-3 py-2 font-medium text-[var(--viz-text)]">
                  {user.name}
                  {user.id === adminId && (
                    <span className="ml-2 text-xs text-[var(--viz-series)]">
                      (siz)
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-[var(--viz-text-secondary)]">
                  {user.email}
                </td>
                <td className="px-3 py-2 text-[var(--viz-text-secondary)]">
                  {user.university ?? "—"}
                </td>
                <td className="px-3 py-2 text-right text-[var(--viz-text)]">
                  {user._count.folders}
                </td>
                <td className="px-3 py-2 text-right text-[var(--viz-text)]">
                  {user._count.exams}
                </td>
                <td className="px-3 py-2 text-right text-[var(--viz-text-secondary)]">
                  {fmtDate(user.createdAt)}
                </td>
                <td className="px-3 py-2">
                  <UserActions
                    userId={user.id}
                    role={user.role}
                    email={user.email}
                    isSelf={user.id === adminId}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Card>
    </PageShell>
  );
}
