import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminId } from "@/lib/session";
import { PageContainer, PageHeader, Section } from "@/components/app/page";
import { UserActions } from "./UserActions";

/**
 * Yönetim ekranı.
 *
 * Yetki kontrolü SUNUCUDA ve sayfanın ilk satırında. Eski sürümde bu sayfa
 * hiçbir kontrol yapmıyordu: `fetch("http://localhost:5000/users")` ile sabit
 * bir adrese istek atıyordu (üstelik backend 8080'deydi, yani üretimde tamamen
 * kırıktı) ve arkadaki uç nokta da rol kontrolü yapmadığı için giriş yapmış
 * herkes tüm kullanıcı listesini çekebiliyordu.
 *
 * Yetkisiz kullanıcıya 403 yerine 404 gösteriliyor: sayfanın varlığını bile
 * sızdırmamak için.
 */
export default async function DashboardPage() {
  let adminId: string;
  try {
    adminId = await requireAdminId();
  } catch {
    notFound();
  }

  const users = await prisma.appUser.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      university: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: { select: { folders: true, exams: true } },
    },
  });

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Yönetim"
        title="Kullanıcılar"
        description={`${users.length} kayıtlı kullanıcı. Rolleri buradan değiştirebilirsiniz.`}
      />

      <Section flush>
        {users.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-500">Henüz kullanıcı yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  {["Ad", "E-posta", "Kurum", "Klasör", "Sınav"].map((header) => (
                    <th key={header} className="whitespace-nowrap px-5 py-3">
                      {header}
                    </th>
                  ))}
                  <th className="px-5 py-3 text-right">Rol / işlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-gray-900">
                      {user.name}
                      {user.id === adminId && <span className="ml-2 text-xs font-normal text-blue-600">(siz)</span>}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-gray-600">{user.email}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-gray-600">{user.university ?? "—"}</td>
                    <td className="px-5 py-3 tabular-nums text-gray-600">{user._count.folders}</td>
                    <td className="px-5 py-3 tabular-nums text-gray-600">{user._count.exams}</td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <UserActions userId={user.id} role={user.role} email={user.email} isSelf={user.id === adminId} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </PageContainer>
  );
}
