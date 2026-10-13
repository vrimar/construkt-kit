import { Avatar as ArkAvatar, AvatarContext } from "@ark-ui/react/avatar";
import { UserIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { avatar } from "#styled-system/recipes";

const { withProvider, withContext } = createSlotRecipeContext(avatar);

const Root = withProvider(ArkAvatar.Root, "root");
const RootProvider = withProvider(ArkAvatar.RootProvider, "root");
const Image = withContext(ArkAvatar.Image, "image", {
  defaultProps: {
    draggable: "false",
    referrerPolicy: "no-referrer",
  },
});

export interface AvatarFallbackProps extends ComponentProps<typeof StyledFallback> {
  /**
   * The name to derive the initials from.
   * If not provided, the fallback will display a generic icon.
   */
  name?: string | undefined;
}

const StyledFallback = withContext(ArkAvatar.Fallback, "fallback");

function Fallback({ ref, name, children, asChild, ...rest }: AvatarFallbackProps) {
  const fallbackContent =
    children || asChild ? children : (name && getInitials(name)) || <UserIcon />;

  return (
    <StyledFallback
      ref={ref}
      asChild={asChild}
      {...rest}
    >
      {fallbackContent}
    </StyledFallback>
  );
}

const firstChar = (word = "") => Array.from(word)[0] ?? "";

const getInitials = (name: string) => {
  const names = name.trim().split(/\s+/);
  const lastName = names.length > 1 ? names[names.length - 1] : "";
  return `${firstChar(names[0])}${firstChar(lastName)}`;
};

export type AvatarRootProps = ComponentProps<typeof Root>;

export const Avatar = {
  Root,
  RootProvider,
  Image,
  Fallback,
  Context: AvatarContext,
};
