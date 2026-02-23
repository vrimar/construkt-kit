"use client";

import type { ChakraProviderProps } from "@chakra-ui/react";
import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defaultSystem,
  defineConfig,
  defineRecipe,
  defineSemanticTokens,
  defineSlotRecipe,
  defineTokens,
  mergeConfigs,
} from "@chakra-ui/react";

export function ThemeProvider(props: ChakraProviderProps) {
  return <ChakraProvider {...props}></ChakraProvider>;
}

export {
  createSystem,
  defaultConfig,
  defaultSystem,
  defineConfig,
  defineRecipe,
  defineSemanticTokens,
  defineSlotRecipe,
  defineTokens,
  mergeConfigs,
};
export type { ChakraProviderProps };
