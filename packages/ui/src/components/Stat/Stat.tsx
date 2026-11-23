import { NumberFormatter } from "@internationalized/number";
import type { ComponentProps, ReactNode } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { stat } from "#styled-system/recipes";

import { useLocale } from "../../primitives/locale";
import { renderable } from "../../primitives/render";
import { Badge, type BadgeProps } from "../Badge";
import { InfoTip } from "../ToggleTip";

const { withProvider, withContext } = createSlotRecipeContext(stat);

const StatRoot = withProvider(renderable.div, "root");
const StatHelpText = withContext(renderable.span, "helpText");
const StatValueUnit = withContext(renderable.span, "valueUnit");

type StatLabelBaseProps = ComponentProps<typeof StatLabelRoot>;

interface StatLabelProps extends StatLabelBaseProps {
  info?: ReactNode;
}

const StatLabelRoot = withContext(renderable.span, "label");

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

const StatValueTextRoot = withContext(renderable.span, "valueText");

type StatValueTextBaseProps = ComponentProps<typeof StatValueTextRoot>;

interface StatValueTextProps extends StatValueTextBaseProps {
  value?: number;
  formatOptions?: Intl.NumberFormatOptions;
}

function StatValueText({ ref, value, formatOptions, children, ...rest }: StatValueTextProps) {
  const { locale } = useLocale();
  return (
    <StatValueTextRoot
      {...rest}
      ref={ref}
    >
      {children || (value != null && new NumberFormatter(locale, formatOptions).format(value))}
    </StatValueTextRoot>
  );
}

const TrendIndicator = withContext(renderable.span, "trendIndicator");

const TREND_GLYPHS = { up: "▲", down: "▼" };

function createTrend(colorPalette: BadgeProps["colorPalette"], direction: "up" | "down") {
  return function StatTrend({ ref, children, ...props }: BadgeProps) {
    return (
      <Badge
        colorPalette={colorPalette}
        gap="0"
        {...props}
        ref={ref}
      >
        <TrendIndicator data-direction={direction}>{TREND_GLYPHS[direction]}</TrendIndicator>
        {children}
      </Badge>
    );
  };
}

const StatUpTrend = createTrend("success", "up");
const StatDownTrend = createTrend("danger", "down");

export const Stat = {
  Root: StatRoot,
  Label: StatLabel,
  ValueText: StatValueText,
  UpTrend: StatUpTrend,
  DownTrend: StatDownTrend,
  HelpText: StatHelpText,
  ValueUnit: StatValueUnit,
};
