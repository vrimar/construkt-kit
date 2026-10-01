import { ark } from "@ark-ui/react/factory";
import type { ComponentProps } from "react";

import { styled } from "#styled-system/jsx";

export type ImageProps = ComponentProps<typeof Image>;
export const Image = styled(ark.img, { base: { objectFit: "cover" } });
