import type { ComponentProps } from "react";

import { styled } from "#styled-system/jsx";

import { renderable } from "../../primitives/render";

export type ImageProps = ComponentProps<typeof Image>;
export const Image = styled(renderable.img, { base: { objectFit: "cover" } });
