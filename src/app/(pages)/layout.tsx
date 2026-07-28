import { Metadata } from "next";
import { redirect } from "next/navigation";
import Header from "../(components)/Header";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
 * Oturum ve rol burada, sunucuda okunuyor. Eskiden bu iş Header içinde
 * `useEffect` ile yapılıyordu: sayfa render edildikten sonra backend'e sorulup
 * gerekirse `/login`'e atılıyordu — yani içerik bir an görünüyordu. Artık
 * middleware isteği zaten sayfaya ulaşmadan kesiyor; buradaki kontrol ikinci
 * savunma katmanı.
 */
const PagesLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.appUser.findUnique({
    where: { id: session.user.id },
    select: { email: true, role: true },
  });

  return (
    <div>
      <Header
        email={user?.email ?? session.user.email ?? "Profil"}
        isAdmin={user?.role === "ADMIN"}
      />
      {children}
    </div>
  );
};

export default PagesLayout;
