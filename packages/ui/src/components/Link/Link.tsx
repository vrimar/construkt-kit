import { ark } from "@ark-ui/react/factory";
import { styled } from "@construkt-kit/styled-system/jsx";
import { link } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

export type LinkProps = ComponentProps<typeof Link>;
export const Link = styled(ark.a, link);
