import { createContext } from "@ark-ui/react/utils";

import type { ButtonVariantProps } from "#styled-system/recipes";

import type { ButtonProps } from "./Button";

export type ButtonGroupContextProps = ButtonVariantProps & Pick<ButtonProps, "colorPalette">;

export const [ButtonPropsProvider, useButtonPropsContext] = createContext<ButtonGroupContextProps>({
  name: "ButtonPropsContext",
  hookName: "useButtonPropsContext",
  providerName: "<PropsProvider />",
  strict: false,
});
