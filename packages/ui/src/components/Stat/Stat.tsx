import { ark } from "@ark-ui/react/factory";
import { createStyleContext, styled } from "@construkt-kit/styled-system/jsx";
import { stat } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps, ReactNode } from "react";

import { Badge, type BadgeProps } from "../Badge";
import { InfoTip } from "../ToggleTip";

const { withProvider, withContext } = createStyleContext(stat);

const StatRoot = withProvider(ark.div, "root");
const StatHelpText = withContext(ark.span, "helpText");
const StatValueUnit = withContext(ark.span, "valueUnit");

type StatLabelBaseProps = ComponentProps<typeof StatLabelRoot>;

interface StatLabelProps extends StatLabelBaseProps {
  info?: ReactNode;
}

const StatLabelRoot = withContext(ark.span, "label");

function StatLabel({ ref, info, children, ...rest }: StatLabelProps) {
  return (
    <StatLabelRoot
      {...rest}
      ref={ref}
    >
      {children}
      {info && <InfoTip>{info}</InfoTip>}
    </StatLabelRoot>
  );
}

const StatValueTextRoot = withContext(ark.span, "valueText");

type StatValueTextBaseProps = ComponentProps<typeof StatValueTextRoot>;

interface StatValueTextProps extends StatValueTextBaseProps {
  value?: number;
  formatOptions?: Intl.NumberFormatOptions;
}

function StatValueText({ ref, value, formatOptions, children, ...rest }: StatValueTextProps) {
  return (
    <StatValueTextRoot
      {...rest}
      ref={ref}
    >
      {children || (value != null && new Intl.NumberFormat(undefined, formatOptions).format(value))}
    </StatValueTextRoot>
  );
}

const TrendIndicator = styled(ark.span, {
  base: {
    fontSize: "xs",
  },
  variants: {
    direction: {
      up: { _before: { content: '"▲"' } },
      down: { _before: { content: '"▼"' } },
    },
  },
});

function createTrend(colorPalette: BadgeProps["colorPalette"], direction: "up" | "down") {
  return function StatTrend({ ref, children, ...props }: BadgeProps) {
    return (
      <Badge
        colorPalette={colorPalette}
        gap="0"
        {...props}
        ref={ref}
      >
        <TrendIndicator direction={direction} />
        {children}
      </Badge>
    );
  };
}

const StatUpTrend = createTrend("green", "up");
const StatDownTrend = createTrend("red", "down");

export const Stat = {
  Root: StatRoot,
  Label: StatLabel,
  ValueText: StatValueText,
  UpTrend: StatUpTrend,
  DownTrend: StatDownTrend,
  HelpText: StatHelpText,
  ValueUnit: StatValueUnit,
};
