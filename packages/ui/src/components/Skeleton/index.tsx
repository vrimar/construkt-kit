import { ark } from "@ark-ui/react/factory";
import type { ComponentProps } from "react";
import { Stack, type StackProps, styled } from "@b3/styled-system/jsx";
import { skeleton } from "@b3/styled-system/recipes";

import type { WithRef } from "../../types";

export type SkeletonProps = ComponentProps<typeof Skeleton>;
export const Skeleton = styled(ark.div, skeleton);

export type SkeletonCircleProps = ComponentProps<typeof SkeletonCircle>;
export const SkeletonCircle = styled(ark.div, skeleton, { defaultProps: { circle: true } });

export interface SkeletonTextProps extends SkeletonProps {
  /**
   * Number of lines to display
   * @default 3
   */
  noOfLines?: number | undefined;
  rootProps?: StackProps | undefined;
}

export const SkeletonText = ({
  ref,
  noOfLines = 3,
  rootProps,
  ...skeletonProps
}: WithRef<SkeletonTextProps>) => {
  return (
    <Stack
      ref={ref}
      width="full"
      {...rootProps}
    >
      {[...Array(noOfLines).keys()].map((index) => (
        <Skeleton
          key={index}
          height="4"
          _last={{ maxW: noOfLines === 1 ? "100%" : "80%" }}
          {...skeletonProps}
        />
      ))}
    </Stack>
  );
};
