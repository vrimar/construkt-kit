import { ark } from "@ark-ui/react/factory";
import { createContext, mergeProps } from "@ark-ui/react/utils";
import { type ComponentProps, cloneElement, isValidElement } from "react";

import { styled } from "#styled-system/jsx";
import { type ButtonVariantProps, button } from "#styled-system/recipes";

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
  const buttonProps = mergeProps<ButtonProps>(propsContext, props);

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
  const isLoading = !props.asChild && loading;
  return (
    <BaseButton
      type={props.asChild ? undefined : "button"}
      ref={ref}
      {...rest}
      data-loading={isLoading ? "" : undefined}
      disabled={isLoading || rest.disabled}
    >
      {props.asChild ? (
        withIcons(children, leftIcon, rightIcon)
      ) : isLoading ? (
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

const withIcons = (
  child: React.ReactNode,
  leftIcon: React.ReactNode,
  rightIcon: React.ReactNode,
) => {
  if ((!leftIcon && !rightIcon) || !isValidElement<{ children?: React.ReactNode }>(child)) {
    return child;
  }
  return cloneElement(child, undefined, leftIcon, child.props.children, rightIcon);
};

export interface ButtonGroupProps extends GroupProps, ButtonVariantProps {}

export const ButtonGroup = ({ ref, ...props }: WithRef<ButtonGroupProps>) => {
  const [variantProps, otherProps] = button.splitVariantProps(props);
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
