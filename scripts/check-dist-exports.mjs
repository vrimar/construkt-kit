#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  SyntaxKind,
  isExportDeclaration,
  isNamedExports,
  isSourceFile,
} from "typescript/unstable/ast";
import { API, SymbolFlags } from "typescript/unstable/sync";

const tsconfigPath = path.resolve("tsconfig.json");

const exportTargets = (target) =>
  typeof target === "string"
    ? [target]
    : Object.values(target ?? {}).flatMap((value) => exportTargets(value));

const sourceEntryOf = (distEntry) => {
  const name = distEntry.slice("dist/".length, -path.extname(distEntry).length);
  const candidates = ["", "/index"].flatMap((suffix) =>
    [".ts", ".tsx"].map((extension) => `src/${name}${suffix}${extension}`),
  );
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(`dist-exports: no source entry for ${distEntry} (${candidates.join(", ")})`);
  }
  return found;
};

const { exports: packageExports } = JSON.parse(readFileSync("package.json", "utf8"));
const distEntries = [
  ...new Set(
    exportTargets(packageExports)
      .filter((target) => /^\.\/dist\/[^*]+\.m?js$/.test(target))
      .map((target) => target.slice(2)),
  ),
];
if (distEntries.length === 0) throw new Error("dist-exports: package.json exports no dist entry");
const entries = distEntries.map((distEntry) => {
  const srcEntry = sourceEntryOf(distEntry);
  return {
    srcEntry,
    distEntry,
    srcPath: path.resolve(srcEntry),
    distPath: path.resolve(distEntry),
  };
});

const sourceFileOf = (project, fileName) => {
  const sourceFile = project?.program.getSourceFile(fileName);
  if (!sourceFile) throw new Error(`dist-exports: cannot load ${path.relative(".", fileName)}`);
  return sourceFile;
};

const isTypeOnlyDeclaration = (declaration) => {
  for (let node = declaration; node && !isSourceFile(node); node = node.parent) {
    if (node.isTypeOnly || node.phaseModifier === SyntaxKind.TypeKeyword) return true;
  }
  return false;
};

const readValueExports = (project, srcPath) => {
  const { checker } = project;
  const moduleSymbol = checker.getSymbolAtLocation(sourceFileOf(project, srcPath));
  return checker
    .getExportsOfModule(moduleSymbol)
    .filter((symbol) => {
      let target = symbol;
      // A type-only re-export of a class resolves to a value yet emits nothing.
      while (target?.flags & SymbolFlags.Alias) {
        if (target.declarations.some((handle) => isTypeOnlyDeclaration(handle.resolve(project)))) {
          return false;
        }
        target = checker.getImmediateAliasedSymbol(target);
      }
      return (target?.flags & SymbolFlags.Value) !== 0;
    })
    .map((symbol) => symbol.name);
};

const readExportList = (project, distPath) =>
  sourceFileOf(project, distPath)
    .statements.filter((statement) => isExportDeclaration(statement) && statement.exportClause)
    .flatMap(({ exportClause }) =>
      isNamedExports(exportClause)
        ? exportClause.elements.map((element) => element.name.text)
        : [exportClause.name.text],
    );

const api = new API({ cwd: process.cwd() });
let results;
try {
  const snapshot = api.updateSnapshot({
    openProjects: [tsconfigPath],
    openFiles: entries.map((entry) => entry.distPath),
  });
  const project = snapshot.getProject(tsconfigPath);
  results = entries.map((entry) => ({
    ...entry,
    srcNames: new Set(readValueExports(project, entry.srcPath)),
    distNames: new Set(
      readExportList(snapshot.getDefaultProjectForFile(entry.distPath), entry.distPath),
    ),
  }));
} finally {
  api.close();
}

let failed = false;
for (const { srcEntry, distEntry, srcNames, distNames } of results) {
  const missing = [...srcNames].filter((name) => !distNames.has(name)).sort();
  const extra = [...distNames].filter((name) => !srcNames.has(name)).sort();

  if (missing.length) {
    console.error(
      `dist-exports: ${distEntry} drops ${missing.length} value export(s) of ${srcEntry}:\n`,
    );
    for (const name of missing) console.error(`  ${name}`);
  }
  if (extra.length) {
    if (missing.length) console.error("");
    console.error(
      `dist-exports: ${distEntry} exports ${extra.length} name(s) ${srcEntry} doesn't:\n`,
    );
    for (const name of extra) console.error(`  ${name}`);
  }
  if (missing.length || extra.length) {
    failed = true;
    continue;
  }
  console.log(
    `dist-exports: ${distEntry} ships all ${srcNames.size} value exports of ${srcEntry}.`,
  );
}
if (failed) process.exit(1);
