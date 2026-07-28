import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../(components)/Header";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "TestMetrix",
  description:
    "Test ve madde analizi platformu — psikometrik istatistikler ve raporlama",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

/**
 * Korumalı sayfaların ortak düzeni.
 *
 * Buradan `/login`'e yönlendirme YAPILMAZ. Route koruması tek bir yerde,
 * `middleware.ts`'te; istek buraya ulaştıysa middleware onu zaten geçirmiştir.
 * Oturum yine de okunamıyorsa `notFound()` denir — yönlendirme olmadığı için
 * `/login` ⇄ `/folders` döngüsü oluşamaz.
 */
const PagesLayout = async ({ children }: { children: React.ReactNode }) => {
  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const user = await prisma.appUser.findUnique({
    where: { id: sessionUser.id },
    select: { email: true, role: true },
  });

  return (
    <div>
      <Header
        email={user?.email ?? sessionUser.email ?? "Profil"}
        isAdmin={user?.role === "ADMIN"}
      />
      {children}
    </div>
  );
};

export default PagesLayout;
