import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const packageRoot = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : process.cwd();

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

const roots = [
  path.join(packageRoot, "dist"),
  packageRoot,
  path.join(packageRoot, "styled-system"),
];

for (const { file, types, keyword } of patches) {
  let targetPath;
  let source;

  for (const root of roots) {
    const candidatePath = path.join(root, file);
    try {
      source = await readFile(candidatePath, "utf8");
      targetPath = candidatePath;
      break;
    } catch {
      continue;
    }
  }

  if (!targetPath || source == null) {
    throw new Error(`Could not find ${file} under ${packageRoot}`);
  }

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
