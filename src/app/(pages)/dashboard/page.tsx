import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminId } from "@/lib/session";
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Kullanıcılar</h1>
          <p className="mt-1 text-sm text-gray-600">
            Kullanıcıların rollerini buradan yönetebilirsiniz.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Ad", "E-posta", "Üniversite", "Klasör", "Sınav"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol / İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                    {user.id === adminId && (
                      <span className="ml-2 text-xs text-blue-600">(siz)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.university ?? "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user._count.folders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user._count.exams}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
          </table>
        </div>

        {users.length === 0 && (
          <p className="mt-6 text-center text-sm text-gray-500">
            Henüz kullanıcı yok.
          </p>
        )}
      </div>
    </div>
  );
}
