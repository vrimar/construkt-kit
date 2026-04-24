import { ark } from "@ark-ui/react/factory";
import type { ComponentProps } from "react";
import { styled } from "@b3/styled-system/jsx";
import { link } from "@b3/styled-system/recipes";

export type LinkProps = ComponentProps<typeof Link>;
export const Link = styled(ark.a, link);
