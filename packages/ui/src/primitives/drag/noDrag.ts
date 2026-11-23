/** Marks an element that handles its own presses, so no swipe or drag around it starts there. */
export const noDragProps = { "data-no-drag": "" } as const;

/** Whether `target` sits inside an element marked with `noDragProps`. */
export const isNoDragTarget = (target: EventTarget | null): boolean =>
  target instanceof Element && target.closest("[data-no-drag]") !== null;
