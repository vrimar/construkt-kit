import type { WithRef } from "../../types";
import { rendersOwnContent } from "../renderContent";
import { Button, type ButtonProps } from "./Button";

export interface IconButtonProps extends ButtonProps {
  icon?: React.ReactNode | undefined;
}

export const IconButton = ({
  ref,
  icon,
  leftIcon,
  children,
  ...props
}: WithRef<IconButtonProps, HTMLButtonElement>) => {
  const ownContent = rendersOwnContent(props.render);
  return (
    <Button
      px="0"
      py="0"
      ref={ref}
      {...props}
      leftIcon={ownContent ? (icon ?? leftIcon) : leftIcon}
    >
      {ownContent ? children : (icon ?? children)}
    </Button>
  );
};
