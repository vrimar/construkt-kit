import { createContext, useContext } from "react";

export interface Locale {
  locale: string;
  dir: "ltr" | "rtl";
}

export const LocaleContext = createContext<Locale>({ locale: "en-US", dir: "ltr" });

export const useLocale = (): Locale => useContext(LocaleContext);

const RTL_SCRIPTS = new Set([
  "Adlm",
  "Arab",
  "Armi",
  "Avst",
  "Hebr",
  "Mand",
  "Mend",
  "Nkoo",
  "Rohg",
  "Samr",
  "Syrc",
  "Thaa",
]);

export const isRTL = (locale: string): boolean =>
  RTL_SCRIPTS.has(new Intl.Locale(locale).maximize().script ?? "");
