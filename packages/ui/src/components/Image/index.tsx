import { ark } from "@ark-ui/react/factory";
import { styled } from "@construkt-kit/styled-system/jsx";
import type { ComponentProps } from "react";

export type ImageProps = ComponentProps<typeof Image>;
export const Image = styled(ark.img, { base: { objectFit: "cover" } });
