import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Gerçek route koruması.
 *
 * Eski sürümde koruma her sayfada `useEffect` içinde `/user-authentication`
 * çağırıp `router.push("/login")` yapmakla sağlanıyordu — yani sayfa ve verisi
 * render edildikten *sonra* yönlendirme oluyordu. Burada istek sayfaya hiç
 * ulaşmadan kesiliyor.
 *
 * NOT: Bu koruma `next@15.1.3`'te CVE-2025-29927 (`x-middleware-subrequest`
 * başlığıyla middleware atlatma) nedeniyle geçersiz olurdu; proje bu yüzden
 * 15.5.x'e yükseltildi.
 */
export default NextAuth(authConfig).auth;

export const config = {
  /**
   * Varsayılan olarak HER ŞEY korumalı; yalnızca aşağıdakiler serbest:
   * auth uç noktaları, giriş sayfası, Next.js statik dosyaları ve public/ içeriği.
   *
   * Beyaz liste yerine kara liste kullanılması bilinçli: ileride eklenen yeni bir
   * sayfa otomatik olarak korumalı olur. Eski koddaki en büyük sorun, korumanın
   * her yere elle kopyalanması ve bazı yerlerde unutulmasıydı.
   */
  /**
   * `$` ilk sırada: kök adres (`/`) public tanıtım sayfası olduğu için
   * korumanın dışında. Kimlik doğrulama akışının tüm sayfaları (giriş, kayıt,
   * parola sıfırlama) da serbest; diğer her şey varsayılan olarak korumalı.
   *
   * NOT: Sayfa yollarının (`register`, `forgot-password`) yanı sıra bunların
   * ARKASINDAKİ API rotaları da (`api/register`, `api/password/*`) burada
   * olmalı. Bu unutulunca middleware oturumsuz isteği `/login`'e 307 ile
   * yönlendiriyordu; istemci JSON beklerken HTML redirect gövdesi alıp
   * "Unexpected token '<'" hatasıyla çöküyordu — kayıt formu bu yüzden
   * bozuktu.
   */
  matcher: [
    "/((?!$|api/auth|api/register|api/password|login|register|forgot-password|reset-password|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|gif|svg|webp|ico|xlsx|css|js)$).*)",
  ],
};
