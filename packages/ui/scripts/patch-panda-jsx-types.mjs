import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve(process.argv[2] ?? "styled-system");

const isReexportStub = (source) => /^(\s*export \* from (['"])[^'"]+\2;?)+\s*$/.test(source);

// Panda emits these as file-local declarations, but they appear in the public
// types of components built on them, so consumers cannot name them.
const patches = [
  {
    file: path.join("jsx", "create-slot-recipe-context.d.ts"),
    types: [
      "SlotRecipeProviderComponent",
      "SlotRecipeRootProviderComponent",
      "SlotRecipeConsumerComponent",
    ],
    keyword: "type",
  },
];

for (const { file, types, keyword } of patches) {
  const targetPath = path.join(outDir, file);
  const source = await readFile(targetPath, "utf8");
  if (isReexportStub(source)) continue;

  let patchedSource = source;

  for (const typeName of types) {
    patchedSource = patchedSource.replace(
      new RegExp(`^${keyword} ${typeName}\\b`, "m"),
      `export ${keyword} ${typeName}`,
    );

    if (!new RegExp(`^export ${keyword} ${typeName}\\b`, "m").test(patchedSource)) {
      throw new Error(`Could not export ${typeName} in ${targetPath}`);
    }
  }

  if (patchedSource !== source) await writeFile(targetPath, patchedSource);
}

const rewrites = [
  {
    file: path.join("types", "jsx.d.ts"),
    // The nested conditional intersects every style-prop key with every component prop key (TS2590).
    pattern:
      /^type ForwardedStyleKeys<T extends ElementType, F extends string> = F extends keyof JsxStyleProps\s+\? F extends keyof ComponentProps<T> \? F : never\s+: never$/m,
    replacement:
      "type ForwardedStyleKeys<T extends ElementType, F extends string> = Extract<Extract<F, keyof JsxStyleProps>, keyof ComponentProps<T>>",
  },
];

for (const { file, pattern, replacement } of rewrites) {
  const targetPath = path.join(outDir, file);
  const source = await readFile(targetPath, "utf8");

  if (!pattern.test(source)) {
    throw new Error(`Could not find ${pattern} in ${targetPath}`);
  }
  await writeFile(targetPath, source.replace(pattern, replacement));
}
