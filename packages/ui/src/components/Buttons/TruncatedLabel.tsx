import { Span, type SpanProps } from "../Span";
import { Tooltip } from "../Tooltip";

interface TruncatedLabelProps extends SpanProps {
  expanded?: boolean;
}

export function TruncatedLabel({ expanded, children, ...props }: TruncatedLabelProps) {
  return (
    <Tooltip
      label={children}
      showWhenTruncated
      disabled={expanded}
    >
      <Span
        truncate
        {...props}
      >
        {children}
      </Span>
    </Tooltip>
  );
}
