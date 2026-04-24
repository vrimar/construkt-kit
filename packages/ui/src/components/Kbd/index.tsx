import { ark } from "@ark-ui/react/factory";
import { styled } from "@b3/styled-system/jsx";
import { kbd } from "@b3/styled-system/recipes";
import type { ComponentProps } from "@b3/styled-system/types";

export type KbdProps = ComponentProps<typeof Kbd>;
export const Kbd = styled(ark.kbd, kbd);
