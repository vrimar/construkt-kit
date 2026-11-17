import type { SemanticTokens } from "@pandacss/types";

import { type ColorOptions, createSemanticColors } from "./colors";
import { shadows } from "./shadows";

export function createSemanticTokens(options?: ColorOptions): SemanticTokens {
  return {
    colors: createSemanticColors(options),
    shadows,
  };
}
