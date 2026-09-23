import { CheckCircleIcon, CircleAlertIcon, CircleXIcon } from "lucide-react";
import type { ElementType } from "react";

export const statusIcons: Record<string, ElementType | undefined> = {
  warning: CircleAlertIcon,
  success: CheckCircleIcon,
  error: CircleXIcon,
};
