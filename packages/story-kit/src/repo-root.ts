import path from "node:path";
import { fileURLToPath } from "node:url";

// Plain JavaScript only: Panda's config bundler parses a file that reads import.meta.url without stripping types.
export const repoRoot = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");
