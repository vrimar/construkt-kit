import { ark } from "@ark-ui/react/factory";
import { styled } from "@construkt-kit/styled-system/jsx";
import { text } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

export type TextProps = ComponentProps<typeof Text>;
export const Text = styled(ark.p, text);
