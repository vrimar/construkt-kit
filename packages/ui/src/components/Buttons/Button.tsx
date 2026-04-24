import { ark } from "@ark-ui/react/factory";
import { createContext, mergeProps } from "@ark-ui/react/utils";
import { type ComponentProps, useMemo } from "react";
import { styled } from "@b3/styled-system/jsx";
import { type ButtonVariantProps, button } from "@b3/styled-system/recipes";

import type { WithRef } from "../../types";
import { Group, type GroupProps } from "./Group";
import { Loader } from "./Loader";

interface ButtonLoadingProps {
  loading?: boolean | undefined;
  loadingText?: React.ReactNode | undefined;
  spinner?: React.ReactNode | undefined;
  spinnerPlacement?: "start" | "end" | undefined;
}

interface ButtonIconProps {
  leftIcon?: React.ReactNode | undefined;
  rightIcon?: React.ReactNode | undefined;
}

type BaseButtonProps = ComponentProps<typeof BaseButton>;
const BaseButton = styled(ark.button, button);

export interface ButtonProps extends BaseButtonProps, ButtonLoadingProps, ButtonIconProps {}

export const Button = ({ ref, ...props }: WithRef<ButtonProps, HTMLButtonElement>) => {
  const propsContext = useButtonPropsContext();
  const buttonProps = useMemo(
    () => mergeProps<ButtonProps>(propsContext, { ref, ...props }),
    [propsContext, ref, props],
  );

  const {
    loading,
    loadingText,
    children,
    spinner,
    spinnerPlacement,
    leftIcon,
    rightIcon,
    ...rest
  } = buttonProps;
  return (
    <BaseButton
      type="button"
      ref={ref}
      {...rest}
      data-loading={loading ? "" : undefined}
      disabled={loading || rest.disabled}
    >
      {!props.asChild && loading ? (
        <Loader
          spinner={spinner}
          text={loadingText}
          spinnerPlacement={spinnerPlacement}
        >
          {children}
        </Loader>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </BaseButton>
  );
};

export interface ButtonGroupProps extends GroupProps, ButtonVariantProps {}

export const ButtonGroup = ({ ref, ...props }: WithRef<ButtonGroupProps>) => {
  const [variantProps, otherProps] = useMemo(() => button.splitVariantProps(props), [props]);
  return (
    <ButtonPropsProvider value={variantProps}>
      <Group
        ref={ref}
        {...otherProps}
      />
    </ButtonPropsProvider>
  );
};

const [ButtonPropsProvider, useButtonPropsContext] = createContext<ButtonVariantProps>({
  name: "ButtonPropsContext",
  hookName: "useButtonPropsContext",
  providerName: "<PropsProvider />",
  strict: false,
});
