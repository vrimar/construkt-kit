import { ark } from "@ark-ui/react/factory";
import { createStyleContext } from "@construkt-kit/styled-system/jsx";
import { alert } from "@construkt-kit/styled-system/recipes";
import { InfoIcon } from "lucide-react";
import type { ComponentProps } from "react";

import type { WithRef } from "../../types";
import { CloseButton } from "../Buttons";

const { withProvider, withContext } = createStyleContext(alert);

export type AlertRootProps = ComponentProps<typeof Root>;
const Root = withProvider(ark.div, "root");
const Title = withContext(ark.h3, "title");
const Description = withContext(ark.div, "description");
const Content = withContext(ark.div, "content");

type IndicatorProps = ComponentProps<typeof StyledIndicator>;
const StyledIndicator = withContext(ark.span, "indicator");

function Indicator({ ref, children, ...props }: WithRef<IndicatorProps, HTMLSpanElement>) {
  return (
    <StyledIndicator
      ref={ref}
      {...props}
    >
      {children || <InfoIcon />}
    </StyledIndicator>
  );
}

export interface AlertProps extends Omit<AlertRootProps, "title"> {
  title?: React.ReactNode;
  icon?: React.ReactElement;
  closable?: boolean;
  onClose?: () => void;
  startElement?: React.ReactNode;
  endElement?: React.ReactNode;
}

function AlertComponent({
  ref,
  title,
  children,
  icon,
  closable,
  onClose,
  startElement,
  endElement,
  ...rest
}: WithRef<AlertProps>) {
  return (
    <Root
      ref={ref}
      {...rest}
    >
      {startElement || <Indicator>{icon}</Indicator>}
      {children ? (
        <Content>
          <Title>{title}</Title>
          <Description>{children}</Description>
        </Content>
      ) : (
        <Title flex="1">{title}</Title>
      )}
      {endElement}
      {closable && (
        <CloseButton
          size="sm"
          pos="relative"
          top="-2"
          insetEnd="-2"
          alignSelf="flex-start"
          onClick={onClose}
        />
      )}
    </Root>
  );
}

export const Alert = Object.assign(AlertComponent, {
  Root,
  Title,
  Description,
  Content,
  Indicator,
});
