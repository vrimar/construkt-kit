import { ark } from "@ark-ui/react/factory";
import { InfoIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { createStyleContext, styled } from "styled-system/jsx";
import { stat } from "styled-system/recipes";

import type { WithRef } from "../../types";
import { Badge, type BadgeProps } from "../Badge";
import { IconButton } from "../Buttons";
import { ToggleTip } from "../ToggleTip";

const { withProvider, withContext } = createStyleContext(stat);

const StatRoot = withProvider(ark.div, "root");
const StatHelpText = withContext(ark.span, "helpText");
const StatValueUnit = withContext(ark.span, "valueUnit");

type StatLabelBaseProps = ComponentProps<typeof StatLabelRoot>;

interface StatLabelProps extends StatLabelBaseProps {
  info?: ReactNode;
}

const StatLabelRoot = withContext(ark.span, "label");

function StatLabel({ ref, info, children, ...rest }: WithRef<StatLabelProps>) {
  return (
    <StatLabelRoot
      {...rest}
      ref={ref}
    >
      {children}
      {info && (
        <ToggleTip content={info}>
          <IconButton
            variant="plain"
            aria-label="info"
            size="2xs"
          >
            <InfoIcon />
          </IconButton>
        </ToggleTip>
      )}
    </StatLabelRoot>
  );
}

const StatValueTextRoot = withContext(ark.span, "valueText");

type StatValueTextBaseProps = ComponentProps<typeof StatValueTextRoot>;

interface StatValueTextProps extends StatValueTextBaseProps {
  value?: number;
  formatOptions?: Intl.NumberFormatOptions;
}

function StatValueText({
  ref,
  value,
  formatOptions,
  children,
  ...rest
}: WithRef<StatValueTextProps>) {
  return (
    <StatValueTextRoot
      {...rest}
      ref={ref}
    >
      {children || (value != null && new Intl.NumberFormat(undefined, formatOptions).format(value))}
    </StatValueTextRoot>
  );
}

const UpIndicator = styled(ark.span, {
  base: {
    _before: { content: '"▲"' },
    fontSize: "xs",
  },
});

const DownIndicator = styled(ark.span, {
  base: {
    _before: { content: '"▼"' },
    fontSize: "xs",
  },
});

function StatUpTrend({ ref, children, ...props }: WithRef<BadgeProps>) {
  return (
    <Badge
      colorPalette="green"
      gap="0"
      {...props}
      ref={ref}
    >
      <UpIndicator />
      {children}
    </Badge>
  );
}

function StatDownTrend({ ref, children, ...props }: WithRef<BadgeProps>) {
  return (
    <Badge
      colorPalette="red"
      gap="0"
      {...props}
      ref={ref}
    >
      <DownIndicator />
      {children}
    </Badge>
  );
}

export const Stat = {
  Root: StatRoot,
  Label: StatLabel,
  ValueText: StatValueText,
  UpTrend: StatUpTrend,
  DownTrend: StatDownTrend,
  HelpText: StatHelpText,
  ValueUnit: StatValueUnit,
};
