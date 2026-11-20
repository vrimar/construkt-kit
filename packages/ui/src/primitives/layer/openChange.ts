import { type ChangeDetails, createChangeDetails } from "../change";

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

export const createOpenChangeDetails = (
  reason: OpenChangeReason,
  event?: Event,
): OpenChangeDetails => createChangeDetails(reason, event);
