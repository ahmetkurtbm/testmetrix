import { BarChart3, Gauge, ListChecks } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import type { ReactNode } from "react";

import { Brand } from "@/app/(components)/Header";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { THEME_COOKIE, parseTheme } from "@/lib/theme";

const FEATURES = [
  { icon: Gauge, text: "Madde güçlüğü, ayırt edicilik ve KR-20/KR-21" },
  { icon: BarChart3, text: "Puan dağılımı ve madde haritası grafikleri" },
  { icon: ListChecks, text: "Çeldirici analizi, Excel ve PDF raporları" },
];

/** Giriş, kayıt ve parola ekranlarının ortak düzeni: solda tanıtım, sağda form. */
export async function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <div className="grid min-h-screen bg-gray-50 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0f1b3d] p-12 text-white dark:bg-[#0a1228] lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]"
        />
        <Link href="/" className="relative">
          <Brand />
        </Link>
        <div className="relative max-w-md">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">Test ve madde analizi</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight">Sınavlarınızın ne ölçtüğünü dakikalar içinde görün.</h2>
          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/80">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-amber-400">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <Link href="/#deneyin" className="relative text-sm text-white/70 hover:text-white">
          Hesap açmadan denemek için tanıtım sayfasına gidin →
        </Link>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="lg:invisible">
              <Brand tone="light" />
            </Link>
            <ThemeSwitcher initial={theme} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{title}</h1>
          {description && <p className="mt-2 text-gray-500">{description}</p>}
          <div className="mt-6 rounded-xl border border-gray-200 bg-surface p-6 sm:p-7">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
