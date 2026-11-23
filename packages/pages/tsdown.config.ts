import { createTsdownConfig } from "@construkt-kit/config/tsdown";

export default createTsdownConfig({
  entry: { index: "src/index.ts", testing: "src/testing/index.ts" },
  neverBundle: ["react", "react-dom", "@construkt-kit/ui", /^@playwright\/test(\/|$)/],
});
