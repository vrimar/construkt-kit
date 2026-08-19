import { createTsdownConfig } from "@construkt-kit/config/tsdown";

export default createTsdownConfig({
  neverBundle: ["react", "react-dom", "@construkt-kit/ui"],
});
