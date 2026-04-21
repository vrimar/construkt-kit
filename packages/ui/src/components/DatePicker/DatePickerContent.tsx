import { Portal } from "@ark-ui/react/portal";
import type { ComponentProps, RefObject } from "react";

import type { WithRef } from "../../types";
import * as Parts from "./parts";

export interface DatePickerContentProps extends ComponentProps<typeof Parts.Content> {
  portalled?: boolean;
  portalRef?: RefObject<HTMLElement | null>;
}

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
