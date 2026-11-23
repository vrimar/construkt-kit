import { type ComponentProps, createContext, useContext } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { alert } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";
import { createCloseTrigger } from "../closeTrigger";
import { statusIcons } from "../statusIcons";

const { withProvider, withContext } = createSlotRecipeContext(alert);

const StyledRoot = withProvider(renderable.div, "root");
const Title = withContext(renderable.h3, "title");
const Description = withContext(renderable.div, "description");
const Content = withContext(renderable.div, "content");
const StyledIndicator = withContext(renderable.span, "indicator");
const CloseTrigger = createCloseTrigger(withContext(renderable.button, "closeTrigger"));

export type AlertRootProps = ComponentProps<typeof StyledRoot>;

const AlertStatusContext = createContext<AlertRootProps["status"]>(undefined);

function Root(props: AlertRootProps) {
  return (
    <AlertStatusContext.Provider value={props.status}>
      <StyledRoot {...props} />
    </AlertStatusContext.Provider>
  );
}

/** The root status's icon unless given children; the info icon for a status without one. */
function Indicator({ children, ...props }: ComponentProps<typeof StyledIndicator>) {
  const status = useContext(AlertStatusContext);
  const StatusIcon = (typeof status === "string" && statusIcons[status]) || statusIcons.info;
  return <StyledIndicator {...props}>{children ?? <StatusIcon />}</StyledIndicator>;
}

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
  return (
    <Root
      ref={ref}
      {...rest}
    >
      {startElement || (indicator !== null && <Indicator>{indicator}</Indicator>)}
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
