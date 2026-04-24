import { ark } from "@ark-ui/react/factory";
import type { ComponentProps } from "react";
import { styled } from "@b3/styled-system/jsx";
import { absoluteCenter } from "@b3/styled-system/recipes";

export type AbsoluteCenterProps = ComponentProps<typeof AbsoluteCenter>;
export const AbsoluteCenter = styled(ark.div, absoluteCenter);
