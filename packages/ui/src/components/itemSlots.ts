import { type ReactNode, useId } from "react";

export const isRenderable = (node: ReactNode) =>
  node != null && typeof node !== "boolean" && node !== "";

export function useItemSlotIds(
  { hint, description }: { hint?: ReactNode; description?: ReactNode },
  describedBy: string | undefined,
) {
  const id = useId();
  const hintId = isRenderable(hint) ? `${id}hint` : undefined;
  const descriptionId = isRenderable(description) ? `${id}description` : undefined;

  return {
    hintId,
    descriptionId,
    describedBy: [describedBy, descriptionId, hintId].filter(Boolean).join(" ") || undefined,
  };
}
