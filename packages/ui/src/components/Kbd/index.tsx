import type { ComponentProps } from "react";

import { styled } from "#styled-system/jsx";
import { kbd } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";

export type KbdProps = ComponentProps<typeof Kbd>;
export const Kbd = styled(renderable.kbd, kbd);
