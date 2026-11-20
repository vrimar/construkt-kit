import type { ComponentProps } from "react";

import { styled } from "#styled-system/jsx";
import { type ButtonVariantProps, button } from "#styled-system/recipes";

import { dataAttr, renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import type { WithRef } from "../../types";
import { wrapRenderContent } from "../renderContent";
import {
  type ButtonGroupContextProps,
  ButtonPropsProvider,
  useButtonPropsContext,
} from "./buttonPropsContext";
import { Group, type GroupProps } from "./Group";
import { Loader } from "./Loader";

interface ButtonLoadingProps {
  /**
   * Shows the spinner and ignores clicks, presses and keys, rendering `aria-disabled` rather than
   * `disabled` so a focused button keeps focus while it loads. Ignored with `render`.
   */
  loading?: boolean | undefined;
  loadingText?: React.ReactNode | undefined;
  spinner?: React.ReactNode | undefined;
  spinnerPlacement?: "start" | "end" | undefined;
}

interface ButtonIconProps {
  leftIcon?: React.ReactNode | undefined;
  rightIcon?: React.ReactNode | undefined;
}

interface ButtonDisabledProps {
  /**
   * Keeps a `disabled` button focusable and hoverable, so a `Tooltip` around it can say why it is
   * disabled. It renders `aria-disabled` in place of `disabled` and ignores clicks, presses and
   * keys, including those of a `Menu.Trigger` or `Popover.Trigger` it is the child of.
   */
  focusableWhenDisabled?: boolean | undefined;
}

interface ButtonPressedProps {
  /** Makes it a toggle button: `aria-pressed`, and `data-pressed` while on for `_on` styles. */
  pressed?: boolean | undefined;
}

type BaseButtonProps = ComponentProps<typeof BaseButton>;
const BaseButton = styled(renderable.button, button);

export interface ButtonProps
  extends
    BaseButtonProps,
    ButtonLoadingProps,
    ButtonIconProps,
    ButtonDisabledProps,
    ButtonPressedProps {}

const softDisabledProps = {
  "aria-disabled": true,
  "data-disabled": "",
  onClick: (event: React.MouseEvent) => event.preventDefault(),
  onKeyDown: undefined,
  onKeyUp: undefined,
  onMouseDown: undefined,
  onMouseUp: undefined,
  onPointerDown: undefined,
  onPointerUp: undefined,
};

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
    focusableWhenDisabled,
    pressed,
    ...rest
  } = buttonProps;
  const isLoading = Boolean(!rest.render && loading);
  const softDisabled = isLoading || Boolean(focusableWhenDisabled && rest.disabled);
  const rendered = isLoading
    ? {
        render: undefined,
        children: (
          <Loader
            spinner={spinner}
            text={loadingText}
            spinnerPlacement={spinnerPlacement}
          >
            {children}
          </Loader>
        ),
      }
    : wrapRenderContent(rest.render, children, (content) =>
        wrapIcons(content, leftIcon, rightIcon),
      );
  return (
    <BaseButton
      type={rest.render ? undefined : "button"}
      ref={ref}
      {...rest}
      {...(pressed === undefined
        ? {}
        : { "aria-pressed": pressed, "data-pressed": dataAttr(pressed) })}
      {...(softDisabled ? softDisabledProps : {})}
      data-loading={isLoading ? "" : undefined}
      disabled={!softDisabled && rest.disabled}
      render={rendered.render}
    >
      {rendered.children}
    </BaseButton>
  );
};

const wrapIcons = (
  content: React.ReactNode,
  leftIcon: React.ReactNode,
  rightIcon: React.ReactNode,
) => (
  <>
    {leftIcon}
    {content}
    {rightIcon}
  </>
);

export interface ButtonGroupProps extends GroupProps, ButtonVariantProps {}

export const ButtonGroup = ({ ref, colorPalette, ...props }: WithRef<ButtonGroupProps>) => {
  const parent = useButtonPropsContext();
  const [variantProps, otherProps] = button.splitVariantProps(props);
  return (
    <ButtonPropsProvider
      value={mergeProps<ButtonGroupContextProps>(parent, { ...variantProps, colorPalette })}
    >
      <Group
        ref={ref}
        colorPalette={colorPalette}
        {...otherProps}
      />
    </ButtonPropsProvider>
  );
};
