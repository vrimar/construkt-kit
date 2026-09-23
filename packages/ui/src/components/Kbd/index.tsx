import { ark } from "@ark-ui/react/factory";
import { styled } from "@construkt-kit/styled-system/jsx";
import { kbd } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

export type KbdProps = ComponentProps<typeof Kbd>;
export const Kbd = styled(ark.kbd, kbd);
