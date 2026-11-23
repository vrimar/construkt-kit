import { createTsdownConfig } from "@construkt-kit/config/tsdown";

export default createTsdownConfig({
  entry: { index: "src/index.ts", reporter: "src/reporter.ts" },
  platform: "node",
  neverBundle: [/^@playwright\/test(\/|$)/],
});
