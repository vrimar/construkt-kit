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
  return idx !== -1 ? args[idx + 1] : null;
}

const configFile = getArg("--config") ?? "api.config.ts";
const urlArg = getArg("--url");

// --- Load the TypeScript config file via tsx --------------------------------

const configPath = path.resolve(process.cwd(), configFile);
const unregister = register();
const { default: kubbConfig, specUrl: configSpecUrl } = await import(
  pathToFileURL(configPath).href
);
unregister();

// --- Resolve spec base URL --------------------------------------------------
// Priority: --url flag > API_URL env > specUrl export from config

const specBaseUrl = urlArg ?? process.env.API_URL ?? configSpecUrl;
if (!specBaseUrl) {
  console.error(
    "Error: API base URL is required.\n" +
      "  Set the API_URL environment variable, pass --url <url>,\n" +
      "  or export `specUrl` from your api.config.ts.",
  );
  process.exit(1);
}

// --- Determine spec fetch URL and local output path -------------------------

const specUrl = new URL("openapi/v1.json", specBaseUrl).toString();
const resolvedConfig = typeof kubbConfig === "function" ? await kubbConfig() : kubbConfig;
const inputPath = path.resolve(
  process.cwd(),
  resolvedConfig.input?.path ?? "./src/api/openapi.json",
);

// --- Fetch spec -------------------------------------------------------------

console.log(`Fetching OpenAPI spec from ${specUrl}`);
await fetchSpec(specUrl, inputPath);

// --- Run kubb code generation -----------------------------------------------

const { build } = await import("@kubb/core");
await build({ config: kubbConfig });

// --- Clean up temporary spec file -------------------------------------------

fs.unlinkSync(inputPath);

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
