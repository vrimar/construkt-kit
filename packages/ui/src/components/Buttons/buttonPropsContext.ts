import { createContext } from "@ark-ui/react/utils";

import type { ButtonVariantProps } from "#styled-system/recipes";

import type { GroupProps } from "./Group";

export type ButtonGroupContextProps = ButtonVariantProps & Pick<GroupProps, "colorPalette">;

export const [ButtonPropsProvider, useButtonPropsContext] = createContext<ButtonGroupContextProps>({
  name: "ButtonPropsContext",
  hookName: "useButtonPropsContext",
  providerName: "<PropsProvider />",
  strict: false,
});
