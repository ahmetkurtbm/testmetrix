import Header from "../(components)/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eğitim Bilgi Sistemi",
  description:
    "Eğitim ve öğretim süreçlerini yönetmek için geliştirilmiş web platformu",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

const PagesLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
};

export default PagesLayout;
