const NEEDS_QUOTES = /[\t\n\r"]/;

const tsvField = (text: string) =>
  NEEDS_QUOTES.test(text) ? `"${text.replaceAll('"', '""')}"` : text;

export function encodeTsv(cells: readonly (readonly string[])[]): string {
  return cells.map((row) => row.map(tsvField).join("\t")).join("\n");
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (char) => HTML_ESCAPES[char]).replace(/\r?\n/g, "<br>");

export function encodeHtml(cells: readonly (readonly string[])[]): string {
  const rows = cells
    .map((row) => `<tr>${row.map((text) => `<td>${escapeHtml(text)}</td>`).join("")}</tr>`)
    .join("");
  return `<table><tbody>${rows}</tbody></table>`;
}
