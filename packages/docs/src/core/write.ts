import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/** Writes only when the content differs, so a dev server watching the output doesn't reload. */
export const writeIfChanged = async (file: string, content: string) => {
  const current = await readFile(file, "utf8").catch(() => undefined);
  if (current === content) return;

  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
};
