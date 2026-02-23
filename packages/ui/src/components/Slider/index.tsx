import { HStack, Slider as ChakraSlider } from "@chakra-ui/react";
import React from "react";

export interface SliderProps extends ChakraSlider.RootProps {
  marks?: Array<number | { value: number; label: React.ReactNode }>;
  label?: React.ReactNode;
  showValue?: boolean;
}

export function Slider({
  ref,
  marks: marksProp,
  label,
  showValue,
  ...rest
}: SliderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const value = rest.defaultValue ?? rest.value;

  const marks = marksProp?.map((mark) => {
    if (typeof mark === "number") return { value: mark, label: undefined };
    return mark;
  });

  const hasMarkLabel = !!marks?.some((mark) => mark.label);

  return (
    <ChakraSlider.Root
      ref={ref}
      cursor="pointer"
      thumbAlignment="center"
      {...rest}
    >
      {label && !showValue && <ChakraSlider.Label fontWeight="medium">{label}</ChakraSlider.Label>}
      {label && showValue && (
        <HStack justify="space-between">
          <ChakraSlider.Label fontWeight="medium">{label}</ChakraSlider.Label>
          <ChakraSlider.ValueText />
        </HStack>
      )}
      <ChakraSlider.Control mb={hasMarkLabel ? "4" : undefined}>
        <ChakraSlider.Track>
          <ChakraSlider.Range />
        </ChakraSlider.Track>
        {value?.map((_, index) => (
          <ChakraSlider.Thumb
            key={index}
            index={index}
          >
            <ChakraSlider.HiddenInput />
          </ChakraSlider.Thumb>
        ))}
      </ChakraSlider.Control>
      {marks?.length && (
        <ChakraSlider.MarkerGroup>
          {marks.map((mark, index) => {
            const value = typeof mark === "number" ? mark : mark.value;
            const label = typeof mark === "number" ? undefined : mark.label;
            return (
              <ChakraSlider.Marker
                key={index}
                value={value}
                fontSize="16px"
              >
                <ChakraSlider.MarkerIndicator />
                {label}
              </ChakraSlider.Marker>
            );
          })}
        </ChakraSlider.MarkerGroup>
      )}
    </ChakraSlider.Root>
  );
}
