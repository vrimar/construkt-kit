import type { SemanticTokens } from "@pandacss/types";

import { type ColorOptions, createSemanticColors } from "./colors";
import { shadows } from "./shadows";

export function createSemanticTokens(options?: ColorOptions): {
  semanticTokens: SemanticTokens;
  paletteNames: string[];
} {
  const { colors, paletteNames } = createSemanticColors(options);
  return { semanticTokens: { colors, shadows }, paletteNames };
}
