import { type ReactNode, useMemo } from "react";

import { type Locale, LocaleContext, isRTL } from "../primitives/locale";

export interface LocaleProviderProps {
  /** BCP 47 tag that components format with and take their direction from. */
  locale: string;
  children?: ReactNode;
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  const value = useMemo<Locale>(() => ({ locale, dir: isRTL(locale) ? "rtl" : "ltr" }), [locale]);
  return <LocaleContext value={value}>{children}</LocaleContext>;
}
