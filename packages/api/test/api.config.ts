import { createKubbConfig } from "@construkt-kit/config/kubb";

export default createKubbConfig({
  inputPath: "./test/fixtures/openapi.json",
  outputPath: "./test/gen",
});
