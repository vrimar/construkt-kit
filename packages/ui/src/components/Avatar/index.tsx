import { Avatar as ArkAvatar, AvatarContext } from "@ark-ui/react/avatar";
import { UserIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { createStyleContext } from "@b3/styled-system/jsx";
import { avatar } from "@b3/styled-system/recipes";

import type { WithRef } from "../../types";

const { withProvider, withContext } = createStyleContext(avatar);

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

function Fallback({ ref, name, children, asChild, ...rest }: WithRef<AvatarFallbackProps>) {
  const fallbackContent = children || asChild ? children : name ? getInitials(name) : <UserIcon />;

  return (
    <StyledFallback
      ref={ref}
      {...rest}
    >
      {fallbackContent}
    </StyledFallback>
  );
}

const getInitials = (name: string) => {
  const names = name.trim().split(" ");
  const firstName = names[0] || "";
  const lastName = names.length > 1 ? names[names.length - 1] : "";
  return firstName && lastName ? `${firstName[0]}${lastName[0]}` : firstName[0];
};

export type AvatarRootProps = ComponentProps<typeof Root>;

export const Avatar = {
  Root,
  RootProvider,
  Image,
  Fallback,
  Context: AvatarContext,
};
