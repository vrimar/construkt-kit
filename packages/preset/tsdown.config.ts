import { createTsdownConfig } from "@construkt-kit/config/tsdown";

export default createTsdownConfig({
  checks: {
    importIsUndefined: false,
  },
});
