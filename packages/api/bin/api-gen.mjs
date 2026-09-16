#!/usr/bin/env node
// @construkt-kit/api api-gen bin — fetches OpenAPI spec, runs kubb codegen, cleans up

import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { register } from "tsx/esm/api";

// --- Parse CLI args --------------------------------------------------------

const args = process.argv.slice(2);

function getArg(flag) {
  const idx = args.indexOf(flag);
  if (idx === -1) return null;

  const value = args[idx + 1];
  if (!value || value.startsWith("--")) {
    console.error(`Error: ${flag} requires a value.`);
    process.exit(1);
  }

  return value;
}

const configFile = getArg("--config") ?? "api.config.ts";
const urlArg = getArg("--url");
const inputArg = getArg("--input");

// --- Load the TypeScript config file via tsx --------------------------------

const configPath = path.resolve(process.cwd(), configFile);
const unregister = register();
const { default: kubbConfig, specUrl: configSpecUrl } = await import(
  pathToFileURL(configPath).href
);
await unregister();

const resolvedConfig = typeof kubbConfig === "function" ? await kubbConfig() : kubbConfig;

const configInput =
  typeof resolvedConfig.input === "string" ? resolvedConfig.input : resolvedConfig.input?.path;
const inputPath = path.resolve(process.cwd(), inputArg ?? configInput ?? "./src/api/openapi.json");

if (!inputArg) {
  const specBaseUrl = urlArg ?? process.env.API_URL ?? configSpecUrl;
  if (!specBaseUrl) {
    console.error(
      "Error: API base URL is required.\n" +
        "  Set the API_URL environment variable, pass --url <url>, pass --input <file>,\n" +
        "  or export `specUrl` from your api.config.ts.",
    );
    process.exit(1);
  }

  const specUrl = new URL("openapi/v1.json", specBaseUrl).toString();
  console.log(`Fetching OpenAPI spec from ${specUrl}`);
  await fetchSpec(specUrl, inputPath);
}

// --- Run kubb code generation -----------------------------------------------

const { createKubb, defineConfig } = await import("kubb");

let result;
try {
  const kubb = createKubb(defineConfig({ ...resolvedConfig, input: inputPath }));
  try {
    result = await kubb.generate();
  } finally {
    kubb.dispose();
  }
} finally {
  if (!inputArg) fs.rmSync(inputPath, { force: true });
}

for (const diagnostic of result.diagnostics) {
  if (diagnostic.severity !== "error" && diagnostic.severity !== "warning") continue;
  console.error(`${diagnostic.severity} ${diagnostic.code}: ${diagnostic.message}`);
  if (diagnostic.help) console.error(`  ${diagnostic.help}`);
}

if (!result.success) process.exit(1);

console.log("API generation complete.");

// ---------------------------------------------------------------------------

function fetchSpec(url, outputPath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const agent = new https.Agent({ rejectUnauthorized: false });
    https
      .get(url, { agent }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch OpenAPI spec: HTTP ${res.statusCode}`));
          return;
        }
        const file = fs.createWriteStream(outputPath);
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
        file.on("error", reject);
      })
      .on("error", reject);
  });
}
