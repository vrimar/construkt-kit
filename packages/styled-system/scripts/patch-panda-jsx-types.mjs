import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const packageRoot = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : process.cwd();

const candidatePaths = [
  path.join(packageRoot, "dist", "jsx", "create-style-context.d.ts"),
  path.join(packageRoot, "jsx", "create-style-context.d.ts"),
  path.join(packageRoot, "styled-system", "jsx", "create-style-context.d.ts"),
];

let createStyleContextTypesPath;
let source;

for (const candidatePath of candidatePaths) {
  try {
    source = await readFile(candidatePath, "utf8");
    createStyleContextTypesPath = candidatePath;
    break;
  } catch {
    continue;
  }
}

if (!createStyleContextTypesPath || source == null) {
  throw new Error(`Could not find create-style-context.d.ts under ${packageRoot}`);
}

const replacements = ["StyleContextProvider", "StyleContextRootProvider", "StyleContextConsumer"];

let patchedSource = source;

for (const typeName of replacements) {
  patchedSource = patchedSource.replace(`type ${typeName}<`, `export type ${typeName}<`);
}

if (patchedSource === source) {
  process.exit(0);
}

for (const typeName of replacements) {
  if (!patchedSource.includes(`export type ${typeName}<`)) {
    throw new Error(`Could not export ${typeName} in ${createStyleContextTypesPath}`);
  }
}

await writeFile(createStyleContextTypesPath, patchedSource);
