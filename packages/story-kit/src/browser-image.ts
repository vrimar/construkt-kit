import fs from "node:fs";

/** The container image whose Chromium every screenshot baseline is captured in. */
export interface BrowserImage {
  image: string;
  digest: string;
  platform: string;
  playwright: string;
  chromium: string;
  userAgentPlatform: string;
}

export function readBrowserImage(): BrowserImage {
  return JSON.parse(
    fs.readFileSync(new URL("../browser-image.json", import.meta.url), "utf8"),
  ) as BrowserImage;
}
