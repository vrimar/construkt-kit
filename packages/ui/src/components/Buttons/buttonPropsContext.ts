import { createContext, useContext } from "react";

import type { ButtonVariantProps } from "#styled-system/recipes";

import type { GroupProps } from "./Group";

export type ButtonGroupContextProps = ButtonVariantProps & Pick<GroupProps, "colorPalette">;

const ButtonPropsContext = createContext<ButtonGroupContextProps | undefined>(undefined);

export const ButtonPropsProvider = ButtonPropsContext.Provider;

export const useButtonPropsContext = (): ButtonGroupContextProps | undefined =>
  useContext(ButtonPropsContext);
