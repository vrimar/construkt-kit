import { Switch as ChakraSwitch } from "@chakra-ui/react";
import React from "react";

export interface SwitchProps extends ChakraSwitch.RootProps {
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  rootRef?: React.Ref<HTMLLabelElement>;
  trackLabel?: { on: React.ReactNode; off: React.ReactNode };
  thumbLabel?: { on: React.ReactNode; off: React.ReactNode };
}

export function Switch({ ref, inputProps, children, rootRef, trackLabel, thumbLabel, ...rest }: SwitchProps & { ref?: React.Ref<HTMLInputElement> }) {

  return (
    <ChakraSwitch.Root
      ref={rootRef}
      cursor="pointer"
      {...rest}
    >
      <ChakraSwitch.HiddenInput
        ref={ref}
        {...inputProps}
      />
      <ChakraSwitch.Control>
        <ChakraSwitch.Thumb>
          {thumbLabel && (
            <ChakraSwitch.ThumbIndicator fallback={thumbLabel?.off}>
              {thumbLabel?.on}
            </ChakraSwitch.ThumbIndicator>
          )}
        </ChakraSwitch.Thumb>
        {trackLabel && (
          <ChakraSwitch.Indicator fallback={trackLabel.off}>{trackLabel.on}</ChakraSwitch.Indicator>
        )}
      </ChakraSwitch.Control>
      {children != null && <ChakraSwitch.Label>{children}</ChakraSwitch.Label>}
    </ChakraSwitch.Root>
  );
}
