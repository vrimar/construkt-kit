import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { alert } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";
import { createCloseTrigger } from "../closeTrigger";
import { statusIcons } from "../statusIcons";

const { withProvider, withContext } = createSlotRecipeContext(alert);

export type AlertRootProps = ComponentProps<typeof Root>;
const Root = withProvider(renderable.div, "root");
const Title = withContext(renderable.h3, "title");
const Description = withContext(renderable.div, "description");
const Content = withContext(renderable.div, "content");
const Indicator = withContext(renderable.span, "indicator", {
  defaultProps: { children: <statusIcons.info /> },
});
const CloseTrigger = createCloseTrigger(
  withContext(renderable.button, "closeTrigger", { defaultProps: { type: "button" } }),
);

export interface AlertProps extends Omit<AlertRootProps, "title"> {
  title?: React.ReactNode;
  /** The status icon by default; `null` leaves the indicator out. */
  indicator?: React.ReactNode;
  /** Shows a close button that calls it. */
  onClose?: () => void;
  startElement?: React.ReactNode;
  endElement?: React.ReactNode;
}

function AlertComponent({
  ref,
  title,
  children,
  indicator,
  onClose,
  startElement,
  endElement,
  ...rest
}: AlertProps) {
  const StatusIcon = typeof rest.status === "string" ? statusIcons[rest.status] : undefined;

  return (
    <Root
      ref={ref}
      {...rest}
    >
      {startElement ||
        (indicator !== null && (
          <Indicator>{indicator ?? (StatusIcon && <StatusIcon />)}</Indicator>
        ))}
      {title && !children ? (
        <Title flex="1">{title}</Title>
      ) : (
        <Content>
          {title ? <Title>{title}</Title> : null}
          {children ? <Description>{children}</Description> : null}
        </Content>
      )}
      {endElement}
      {onClose && <CloseTrigger onClick={onClose} />}
    </Root>
  );
}

export const Alert = Object.assign(AlertComponent, {
  Root,
  Title,
  Description,
  Content,
  Indicator,
  CloseTrigger,
});
