import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const packageRoot = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : process.cwd();

const createStyleContextTypesPath = path.join(
  packageRoot,
  "styled-system",
  "jsx",
  "create-style-context.d.ts",
);

const source = await readFile(createStyleContextTypesPath, "utf8");

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
