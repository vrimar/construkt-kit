import type { ButtonProps as ChakraButtonProps } from "@chakra-ui/react";
import { AbsoluteCenter, Button as ChakraButton, HStack, Spinner } from "@chakra-ui/react";
import React from "react";

interface ButtonBaseProps {
  loading?: boolean;
  loadingText?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
}

export interface ButtonProps extends ChakraButtonProps, ButtonBaseProps {}

export function Button({ ref, loading, disabled, loadingText, children, leftIcon, rightIcon, ...rest }: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {

  const content = (
    <>
      {leftIcon}
      {children}
      {rightIcon}
    </>
  );

  return (
    <ChakraButton
      disabled={loading || disabled}
      ref={ref}
      {...rest}
    >
      {loading && !loadingText ? (
        <>
          <AbsoluteCenter display="inline-flex">
            <Spinner
              size="inherit"
              color="inherit"
            />
          </AbsoluteCenter>
          <HStack
            gap="0.5"
            opacity={0}
          >
            {content}
          </HStack>
        </>
      ) : loading && loadingText ? (
        <>
          <Spinner
            size="inherit"
            color="inherit"
          />
          {loadingText}
        </>
      ) : (
        content
      )}
    </ChakraButton>
  );
}
