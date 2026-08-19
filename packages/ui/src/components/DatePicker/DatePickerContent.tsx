import type { ComponentProps } from "react";

import type { PortalledProps } from "../../types";
import { createPortalledContent } from "../portalledContent";
import * as Parts from "./parts";

export interface DatePickerContentProps
  extends ComponentProps<typeof Parts.Content>, PortalledProps {}

export const DatePickerContent = createPortalledContent(Parts.Positioner, Parts.Content);
