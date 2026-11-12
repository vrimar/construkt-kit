import { type ReactNode, useId } from "react";

const isShown = (node: ReactNode) => node != null && node !== false && node !== "";

export function useItemSlotIds(
  { hint, description }: { hint?: ReactNode; description?: ReactNode },
  describedBy: string | undefined,
) {
  const id = useId();
  const hintId = isShown(hint) ? `${id}hint` : undefined;
  const descriptionId = isShown(description) ? `${id}description` : undefined;

  return {
    hintId,
    descriptionId,
    describedBy: [describedBy, descriptionId, hintId].filter(Boolean).join(" ") || undefined,
  };
}
