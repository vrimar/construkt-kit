import { ark } from "@ark-ui/react/factory";
import type { ComponentProps } from "react";

import { styled } from "#styled-system/jsx";
import { text } from "#styled-system/recipes";

export type TextProps = ComponentProps<typeof Text>;
export const Text = styled(ark.p, text);
