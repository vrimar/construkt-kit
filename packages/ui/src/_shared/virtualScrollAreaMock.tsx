import { Fragment, type ReactNode, useEffect } from "react";

export const virtualScrollAreaProps: { current: Record<string, unknown> } = { current: {} };

export const VirtualScrollArea = ({
  items,
  children,
  header,
  ...props
}: {
  items: unknown[];
  children: (item: unknown, index: number) => ReactNode;
  header?: ReactNode;
}) => {
  useEffect(() => {
    virtualScrollAreaProps.current = props;
  });
  return (
    <>
      {header}
      {items.map((item, index) => (
        <Fragment key={index}>{children(item, index)}</Fragment>
      ))}
    </>
  );
};
