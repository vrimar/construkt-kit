import type { WithRef } from "../../types";
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
  return (
    <Button
      px="0"
      py="0"
      ref={ref}
      {...props}
      leftIcon={props.asChild ? (icon ?? leftIcon) : leftIcon}
    >
      {props.asChild ? children : (icon ?? children)}
    </Button>
  );
};
