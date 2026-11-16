import { CheckCircleIcon, CircleAlertIcon, CircleXIcon, InfoIcon } from "lucide-react";
import type { ElementType } from "react";

const icons = {
  info: InfoIcon,
  warning: CircleAlertIcon,
  success: CheckCircleIcon,
  error: CircleXIcon,
};

/** Icon per status; a status without one, such as `neutral` or `loading`, reads undefined. */
export const statusIcons: Partial<Record<string, ElementType>> & typeof icons = icons;
