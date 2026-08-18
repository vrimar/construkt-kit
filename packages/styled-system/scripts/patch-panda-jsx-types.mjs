import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const outDir = path.join(process.cwd(), "dist");

// Panda emits these as file-local declarations, but they appear in the public
// types of components built on them, so consumers cannot name them.
const patches = [
  {
    file: path.join("jsx", "create-style-context.d.ts"),
    types: ["StyleContextProvider", "StyleContextRootProvider", "StyleContextConsumer"],
    keyword: "type",
  },
  {
    file: path.join("types", "system-types.d.ts"),
    types: ["WithCss"],
    keyword: "interface",
  },
];

for (const { file, types, keyword } of patches) {
  const targetPath = path.join(outDir, file);
  const source = await readFile(targetPath, "utf8");

  let patchedSource = source;

  for (const typeName of types) {
    patchedSource = patchedSource.replace(
      `${keyword} ${typeName}`,
      `export ${keyword} ${typeName}`,
    );
  }

  if (patchedSource === source) continue;

  for (const typeName of types) {
    if (!patchedSource.includes(`export ${keyword} ${typeName}`)) {
      throw new Error(`Could not export ${typeName} in ${targetPath}`);
    }
  }

  await writeFile(targetPath, patchedSource);
}
