#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { API, SignatureKind, SymbolFlags } from "typescript/unstable/sync";

const [distEntry = "dist/index.d.mts"] = process.argv.slice(2);
const distPath = path.resolve(distEntry);
const tsconfigPath = path.resolve("tsconfig.json");
const probeDir = path.resolve("node_modules/.cache/check-dist-types");
const probePath = path.join(probeDir, "probe.ts");

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

const readSubjects = (project) => {
  const { checker } = project;
  const sourceFile = project.program.getSourceFile(distPath);
  if (!sourceFile) throw new Error(`dist-types: cannot load ${path.relative(".", distPath)}`);
  const subjects = [];

  for (const exported of checker.getExportsOfModule(checker.getSymbolAtLocation(sourceFile))) {
    const { name } = exported;
    const symbol = resolveAlias(checker, exported);

    if (symbol.flags & (SymbolFlags.Interface | SymbolFlags.TypeAlias) && name.endsWith("Props")) {
      subjects.push({ name, type: `M.${name}${typeArgumentsOf(project, symbol)}` });
    }
    if (!(symbol.flags & SymbolFlags.Value) || !isPascalCase(name)) continue;

    const valueType = checker.getTypeOfSymbol(symbol);
    if (!valueType) continue;
    if (isComponent(checker, valueType)) {
      subjects.push({ name, type: `ComponentProps<typeof M.${name}>` });
    }
    for (const member of checker.getPropertiesOfType(valueType)) {
      if (!isPascalCase(member.name)) continue;
      const memberType = checker.getTypeOfSymbol(member);
      if (memberType && isComponent(checker, memberType)) {
        subjects.push({
          name: `${name}.${member.name}`,
          type: `ComponentProps<typeof M.${name}.${member.name}>`,
        });
      }
    }
  }
  return subjects;
};

const api = new API({ cwd: process.cwd() });
let subjects;
try {
  const snapshot = api.updateSnapshot({ openProjects: [tsconfigPath], openFiles: [distPath] });
  subjects = readSubjects(snapshot.getDefaultProjectForFile(distPath));
} finally {
  api.close();
}

const OPERATIONS = ["Omit", "keyof", "interface extends"];
const header = [
  `import type { ComponentProps } from "react";`,
  `import type * as M from ${JSON.stringify(path.relative(probeDir, distPath))};`,
  `interface Item { id: number; name: string }`,
];
const lines = [...header];
const lineOwners = new Map();
subjects.forEach(({ type }, index) => {
  const own = (operation, line) => {
    lines.push(line);
    lineOwners.set(lines.length, { subject: subjects[index], operation });
  };
  lines.push(`type S${index} = ${type};`);
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
try {
  execFileSync("tsc", ["-p", path.join(probeDir, "tsconfig.json"), "--pretty", "false"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (error) {
  output = `${error.stdout ?? ""}${error.stderr ?? ""}`;
}

const failures = new Map();
for (const match of output.matchAll(/probe\.ts\((\d+),\d+\): error (TS\d+): ([^\n]*)/g)) {
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
