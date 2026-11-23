/** The devices every story renders on; each is a Playwright project of the same name. */
export const DEVICES = {
  desktop: { viewport: { width: 1280, height: 900 } },
  phone: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
} as const;

export type Device = keyof typeof DEVICES;

export const PROJECTS = Object.keys(DEVICES) as Device[];

/** The story tag that keeps a story, or a spec test passing the device to `storyTags`, to one device. */
export const DEVICE_ONLY = {
  desktop: "desktop-only",
  phone: "phone-only",
} as const satisfies Record<Device, string>;
