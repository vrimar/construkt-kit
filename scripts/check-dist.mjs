#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  SyntaxKind,
  isExportDeclaration,
  isNamedExports,
  isSourceFile,
} from "typescript/unstable/ast";
import { API, SignatureKind, SymbolFlags } from "typescript/unstable/sync";

const tsconfigPath = path.resolve("tsconfig.json");
const probeDir = path.resolve("node_modules/.cache/check-dist");
const probePath = path.join(probeDir, "probe.ts");

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

const exportTargets = (target) =>
  typeof target === "string"
    ? [target]
    : Object.values(target ?? {}).flatMap((value) => exportTargets(value));

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
  const dtsEntry = distEntry.replace(/\.(m?)js$/, ".d.$1ts");
  return {
    srcEntry,
    distEntry,
    srcPath: path.resolve(srcEntry),
    distPath: path.resolve(distEntry),
    dtsPath: path.resolve(dtsEntry),
  };
});

const sourceFileOf = (project, fileName) => {
  const sourceFile = project?.program.getSourceFile(fileName);
  if (!sourceFile) throw new Error(`check-dist: cannot load ${path.relative(".", fileName)}`);
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

const isPascalCase = (name) => /^[A-Z]/.test(name);

const resolveAlias = (checker, symbol) =>
  symbol.flags & SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;

const typeArgumentsOf = (project, symbol) => {
  const declaration = symbol.declarations[0]?.resolve(project);
  const parameters = declaration?.typeParameters ?? [];
  let required = parameters.length;
  while (required > 0 && parameters[required - 1].default) required--;
  const args = parameters
    .slice(0, required)
    .map((parameter) => (parameter.constraint ? "any" : "Item"));
  return args.length ? `<${args.join(", ")}>` : "";
};

const isComponent = (checker, type) =>
  checker
    .getSignaturesOfType(type, SignatureKind.Call)
    .some((signature) => signature.getParameters().length > 0);

const readPropsSubjects = (project, dtsPath, module) => {
  const { checker } = project;
  const subjects = [];
  const moduleSymbol = checker.getSymbolAtLocation(sourceFileOf(project, dtsPath));
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    const { name } = exported;
    const symbol = resolveAlias(checker, exported);

    if (symbol.flags & (SymbolFlags.Interface | SymbolFlags.TypeAlias) && name.endsWith("Props")) {
      subjects.push({ name, type: `${module}.${name}${typeArgumentsOf(project, symbol)}` });
    }
    if (!(symbol.flags & SymbolFlags.Value) || !isPascalCase(name)) continue;

    const valueType = checker.getTypeOfSymbol(symbol);
    if (!valueType) continue;
    if (isComponent(checker, valueType)) {
      subjects.push({ name, type: `ComponentProps<typeof ${module}.${name}>` });
    }
    for (const member of checker.getPropertiesOfType(valueType)) {
      if (!isPascalCase(member.name)) continue;
      const memberType = checker.getTypeOfSymbol(member);
      if (memberType && isComponent(checker, memberType)) {
        subjects.push({
          name: `${name}.${member.name}`,
          type: `ComponentProps<typeof ${module}.${name}.${member.name}>`,
        });
      }
    }
  }
  return subjects;
};

const api = new API({ cwd: process.cwd() });
let results;
let subjects;
try {
  const snapshot = api.updateSnapshot({
    openProjects: [tsconfigPath],
    openFiles: entries.flatMap((entry) => [entry.distPath, entry.dtsPath]),
  });
  const project = snapshot.getProject(tsconfigPath);
  results = entries.map((entry) => ({
    ...entry,
    srcNames: new Set(readValueExports(project, entry.srcPath)),
    distNames: new Set(
      readExportList(snapshot.getDefaultProjectForFile(entry.distPath), entry.distPath),
    ),
  }));
  subjects = entries.flatMap((entry, index) =>
    readPropsSubjects(snapshot.getDefaultProjectForFile(entry.dtsPath), entry.dtsPath, `M${index}`),
  );
} finally {
  api.close();
}

let failed = false;
for (const { srcEntry, distEntry, srcNames, distNames } of results) {
  const missing = [...srcNames]
    .filter((name) => !distNames.has(name))
    .sort((a, b) => a.localeCompare(b));
  const extra = [...distNames]
    .filter((name) => !srcNames.has(name))
    .sort((a, b) => a.localeCompare(b));

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

const OPERATIONS = ["Omit", "keyof", "interface extends"];
const lines = [
  `import type { ComponentProps } from "react";`,
  ...entries.map(
    (entry, index) =>
      `import type * as M${index} from ${JSON.stringify(path.relative(probeDir, entry.dtsPath))};`,
  ),
  `interface Item { id: number; name: string }`,
];
const lineOwners = new Map();
subjects.forEach((subject, index) => {
  const own = (operation, line) => {
    lines.push(line);
    lineOwners.set(lines.length, { subject, operation });
  };
  lines.push(`type S${index} = ${subject.type};`);
  own(OPERATIONS[0], `export type O${index} = Omit<S${index}, "__probe">;`);
  own(OPERATIONS[1], `export type K${index} = keyof O${index};`);
  own(OPERATIONS[2], `export interface E${index} extends O${index} {}`);
});

rmSync(probeDir, { recursive: true, force: true });
mkdirSync(probeDir, { recursive: true });
writeFileSync(probePath, `${lines.join("\n")}\n`);
writeFileSync(
  path.join(probeDir, "tsconfig.json"),
  JSON.stringify({
    extends: path.relative(probeDir, tsconfigPath),
    compilerOptions: { noEmit: true, noUnusedLocals: false },
    include: ["probe.ts"],
  }),
);

let output = "";
let tscError;
try {
  execFileSync("tsc", ["-p", path.join(probeDir, "tsconfig.json"), "--pretty", "false"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (error) {
  tscError = error;
  output = `${error.stdout ?? ""}${error.stderr ?? ""}`;
}

const diagnostics = [...output.matchAll(/probe\.ts\((\d+),\d+\): error (TS\d+): ([^\n]*)/g)];
if (tscError && diagnostics.length === 0) {
  console.error(
    `dist-types: tsc failed without a probe diagnostic:\n${output.trim() || tscError.message}`,
  );
  process.exit(1);
}

const failures = new Map();
for (const match of diagnostics) {
  const owner = lineOwners.get(Number(match[1]));
  if (!owner) {
    console.error(`dist-types: probe error outside a subject: ${match[0]}`);
    process.exitCode = 1;
    continue;
  }
  const key = owner.subject.name;
  const entry = failures.get(key) ?? { subject: owner.subject, errors: [] };
  entry.errors.push(`${owner.operation}: ${match[2]} ${match[3]}`);
  failures.set(key, entry);
}

if (failures.size) {
  console.error(
    `dist-types: ${failures.size} of ${subjects.length} exported props types fail a common type operation:\n`,
  );
  for (const { subject, errors } of failures.values()) {
    console.error(`  ${subject.name}  (${subject.type})`);
    for (const error of errors) console.error(`    ${error.slice(0, 220)}`);
  }
  process.exit(1);
}
if (process.exitCode) process.exit(process.exitCode);

console.log(
  `dist-types: ${subjects.length} exported props types resolve under ${OPERATIONS.join(", ")}.`,
);
