import { Portal } from "@ark-ui/react/portal";
import type { ComponentProps } from "react";

import type { PortalledProps, WithRef } from "../../types";
import * as Parts from "./parts";

export interface DatePickerContentProps
  extends ComponentProps<typeof Parts.Content>, PortalledProps {}

export function DatePickerContent({
  ref,
  portalled = true,
  portalRef,
  ...rest
}: WithRef<DatePickerContentProps>) {
  return (
    <Portal
      disabled={!portalled}
      container={portalRef}
    >
      <Parts.Positioner>
        <Parts.Content
          animation="none"
          ref={ref}
          {...rest}
        />
      </Parts.Positioner>
    </Portal>
  );
}
