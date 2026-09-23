import { ark } from "@ark-ui/react/factory";
import { styled } from "@construkt-kit/styled-system/jsx";
import { absoluteCenter } from "@construkt-kit/styled-system/recipes";

import { Span } from "../Span";
import { Spinner } from "../Spinner";

const AbsoluteCenter = styled(ark.span, absoluteCenter);

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
        <Span
          visibility="hidden"
          display="contents"
        >
          {children}
        </Span>
      </Span>
    );
  }

  return <Span display="contents">{children}</Span>;
};
