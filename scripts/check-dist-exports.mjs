#!/usr/bin/env node
import path from "node:path";

import {
  SyntaxKind,
  isExportDeclaration,
  isNamedExports,
  isSourceFile,
} from "typescript/unstable/ast";
import { API, SymbolFlags } from "typescript/unstable/sync";

const [srcEntry = "src/index.ts", distEntry = "dist/index.mjs"] = process.argv.slice(2);
const srcPath = path.resolve(srcEntry);
const distPath = path.resolve(distEntry);
const tsconfigPath = path.resolve("tsconfig.json");

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

const readValueExports = (project) => {
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

const readExportList = (project) =>
  sourceFileOf(project, distPath)
    .statements.filter((statement) => isExportDeclaration(statement) && statement.exportClause)
    .flatMap(({ exportClause }) =>
      isNamedExports(exportClause)
        ? exportClause.elements.map((element) => element.name.text)
        : [exportClause.name.text],
    );

const api = new API({ cwd: process.cwd() });
let srcNames;
let distNames;
try {
  const snapshot = api.updateSnapshot({ openProjects: [tsconfigPath], openFiles: [distPath] });
  srcNames = new Set(readValueExports(snapshot.getProject(tsconfigPath)));
  distNames = new Set(readExportList(snapshot.getDefaultProjectForFile(distPath)));
} finally {
  api.close();
}

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
if (missing.length || extra.length) process.exit(1);

console.log(`dist-exports: ${distEntry} ships all ${srcNames.size} value exports of ${srcEntry}.`);
