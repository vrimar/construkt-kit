import { styled } from "#styled-system/jsx";
import { absoluteCenter } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";
import { Span } from "../Span";
import { Spinner } from "../Spinner";

const AbsoluteCenter = styled(renderable.span, absoluteCenter);

export interface LoaderProps {
  /**
   * The spinner to display when loading
   */
  spinner?: React.ReactNode | undefined;
  /**
   * The placement of the spinner
   * @default "start"
   */
  spinnerPlacement?: "start" | "end" | undefined;
  /**
   * The text to display when loading
   */
  text?: React.ReactNode | undefined;

  children?: React.ReactNode;
}

export const Loader = ({
  spinner = (
    <Spinner
      size="inherit"
      borderWidth="0.125em"
      color="inherit"
    />
  ),
  spinnerPlacement = "start",
  children,
  text,
}: LoaderProps) => {
  if (text) {
    return (
      <Span display="contents">
        {spinnerPlacement === "start" && spinner}
        {text}
        {spinnerPlacement === "end" && spinner}
      </Span>
    );
  }

  if (spinner) {
    return (
      <Span display="contents">
        <AbsoluteCenter display="inline-flex">{spinner}</AbsoluteCenter>
        {/* visibility would empty the accessible name; display: contents gives opacity no box. */}
        <Span
          display="contents"
          color="transparent"
          css={{ "& *": { opacity: "0" } }}
        >
          {children}
        </Span>
      </Span>
    );
  }

  return <Span display="contents">{children}</Span>;
};
