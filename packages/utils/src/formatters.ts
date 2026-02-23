/** Format a number as a localised currency string. */
export function formatCurrency(value: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

/** Format a Date or ISO string as a localised date string. */
export function formatDate(
  value: Date | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
  locale = "en-US",
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}

/** Format a number with thousands separators. */
export function formatNumber(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale).format(value);
}
