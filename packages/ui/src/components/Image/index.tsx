import { styled } from "styled-system/jsx";
import type { HTMLStyledProps } from "styled-system/types";

import type { WithRef } from "../../types";

export interface ImageProps extends HTMLStyledProps<"img"> {}

const StyledImage = styled("img");

export const Image = ({
  ref,
  objectFit = "cover",
  ...rest
}: WithRef<ImageProps, HTMLImageElement>) => {
  return (
    <StyledImage
      ref={ref}
      objectFit={objectFit}
      {...rest}
    />
  );
};
