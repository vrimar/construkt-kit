const PLACEMENTS = ["top-end", "bottom-end"] as const;

/** Where `<Toaster />` stacks its toasts: at the top or bottom end of the viewport. */
export type ToastPlacement = (typeof PLACEMENTS)[number];

export const toastRegionLabel = (placement: ToastPlacement) =>
  `Notifications, ${placement} (alt+T)`;

export const TOAST_REGION_NAME = new RegExp(
  `^Notifications, (${PLACEMENTS.join("|")}) \\(alt\\+T\\)$`,
);
