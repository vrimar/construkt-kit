import type { ChangeDetails } from "../change";

export type OpenChangeReason =
  | "trigger-press"
  | "trigger-hover"
  | "trigger-focus"
  | "trigger-blur"
  | "pointer-leave"
  | "escape-key"
  | "outside-press"
  | "focus-out"
  | "close-press"
  | "item-press"
  | "input-change"
  | "list-navigation"
  | "scroll"
  | "swipe"
  | "parent-close";

/** Why an overlay asked to open or close, and a way to refuse. */
export type OpenChangeDetails = ChangeDetails<OpenChangeReason>;

export interface DismissOptions {
  closeOnEscape?: boolean | undefined;
  closeOnInteractOutside?: boolean | undefined;
}

/** Whether an overlay's `closeOn*` options let it close for `reason`; both default to `true`. */
export function allowsDismiss(
  reason: OpenChangeReason,
  { closeOnEscape = true, closeOnInteractOutside = true }: DismissOptions,
): boolean {
  if (reason === "escape-key") return closeOnEscape;
  if (reason === "outside-press" || reason === "focus-out") return closeOnInteractOutside;
  return true;
}
