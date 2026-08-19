import { createTsdownConfig } from "@construkt-kit/config/tsdown";

export default createTsdownConfig({
  neverBundle: ["react", "@kubb/plugin-client", "@kubb/core"],
});
