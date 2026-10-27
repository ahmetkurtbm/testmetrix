export const THEME_COOKIE = "tm-theme";
export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

/** Çerezdeki tema; tanınmayan ya da boş değer cihaz ayarını izler. */
export function parseTheme(value: string | undefined): Theme {
  return (THEMES as readonly string[]).includes(value ?? "") ? (value as Theme) : "system";
}

/**
 * "Cihaz ayarı" için ilk çizimden önce çalışan betik: sunucu cihaz tercihini
 * bilemediği için `dark` sınıfını burada, sayfa boyanmadan ekler.
 */
export const SYSTEM_THEME_SCRIPT = `try{if(matchMedia("(prefers-color-scheme: dark)").matches)document.documentElement.classList.add("dark")}catch(e){}`;
