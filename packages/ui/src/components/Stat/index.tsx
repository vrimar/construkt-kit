import {
  Badge,
  type BadgeProps,
  FormatNumber,
  IconButton,
  Stat as ChakraStat,
} from "@chakra-ui/react";
import React from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";

import { ToggleTip } from "../ToggleTip";

interface StatLabelProps extends ChakraStat.LabelProps {
  info?: React.ReactNode;
}

function StatLabel({ ref, info, children, ...rest }: StatLabelProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <ChakraStat.Label
      {...rest}
      ref={ref}
    >
      {children}
      {info && (
        <ToggleTip content={info}>
          <IconButton
            variant="ghost"
            aria-label="info"
            size="2xs"
          >
            <HiOutlineInformationCircle />
          </IconButton>
        </ToggleTip>
      )}
    </ChakraStat.Label>
  );
}

interface StatValueTextProps extends ChakraStat.ValueTextProps {
  value?: number;
  formatOptions?: Intl.NumberFormatOptions;
}

function StatValueText({ ref, value, formatOptions, children, ...rest }: StatValueTextProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <ChakraStat.ValueText
      {...rest}
      ref={ref}
    >
      {children ||
        (value != null && (
          <FormatNumber
            value={value}
            {...formatOptions}
          />
        ))}
    </ChakraStat.ValueText>
  );
}

function StatUpTrend({ ref, children, ...props }: BadgeProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <Badge
      colorPalette="green"
      gap="0"
      {...props}
      ref={ref}
    >
      <ChakraStat.UpIndicator />
      {children}
    </Badge>
  );
}

function StatDownTrend({ ref, children, ...props }: BadgeProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <Badge
      colorPalette="red"
      gap="0"
      {...props}
      ref={ref}
    >
      <ChakraStat.DownIndicator />
      {children}
    </Badge>
  );
}

export const Stat = {
  Root: ChakraStat.Root,
  Label: StatLabel,
  ValueText: StatValueText,
  UpTrend: StatUpTrend,
  DownTrend: StatDownTrend,
  HelpText: ChakraStat.HelpText,
  ValueUnit: ChakraStat.ValueUnit,
};
