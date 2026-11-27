#!/usr/bin/env node
import { fileURLToPath } from "node:url";

import { main } from "../dist/cli.mjs";

const code = await main(fileURLToPath(import.meta.url), process.argv.slice(2));
if (code !== undefined) process.exitCode = code;
