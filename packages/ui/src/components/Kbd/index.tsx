import { ark } from "@ark-ui/react/factory";
import { styled } from "@construct-kit/styled-system/jsx";
import { kbd } from "@construct-kit/styled-system/recipes";
import type { ComponentProps } from "@construct-kit/styled-system/types";

export type KbdProps = ComponentProps<typeof Kbd>;
export const Kbd = styled(ark.kbd, kbd);
