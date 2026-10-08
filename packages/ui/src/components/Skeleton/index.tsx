import { ark } from "@ark-ui/react/factory";
import type { ComponentProps } from "react";

import { Stack, type StackProps, styled } from "#styled-system/jsx";
import { type SkeletonVariantProps, skeleton } from "#styled-system/recipes";

import type { CssProp } from "../../types";

export type SkeletonProps = ComponentProps<typeof Skeleton>;
export const Skeleton = styled(ark.div, skeleton);

export type SkeletonCircleProps = ComponentProps<typeof SkeletonCircle>;
export const SkeletonCircle = styled(ark.div, skeleton, { defaultProps: { circle: true } });

const LAST_LINE_WIDTH = "80%";

export interface SkeletonTextProps
  extends Omit<StackProps, keyof SkeletonVariantProps>, SkeletonVariantProps {
  /**
   * Number of lines to display
   * @default 3
   */
  noOfLines?: number | undefined;
  /** Styles for each line. */
  lineCss?: CssProp;
}

export const SkeletonText = ({ noOfLines = 3, lineCss, ...props }: SkeletonTextProps) => {
  const [variantProps, rootProps] = skeleton.splitVariantProps(props);

  return (
    <Stack
      width="full"
      {...rootProps}
    >
      {[...Array(noOfLines).keys()].map((index) => (
        <Skeleton
          key={index}
          height="4"
          _last={{ maxW: noOfLines === 1 ? "100%" : LAST_LINE_WIDTH }}
          {...variantProps}
          css={lineCss}
        />
      ))}
    </Stack>
  );
};
