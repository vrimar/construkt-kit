import { ark } from "@ark-ui/react/factory";
import { styled } from "@construkt-kit/styled-system/jsx";
import { heading } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

export type HeadingProps = ComponentProps<typeof Heading>;
export const Heading = styled(ark.h2, heading);
