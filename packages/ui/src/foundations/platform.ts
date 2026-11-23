// Modified from React Aria's utils/platform.ts (Apache-2.0, Copyright 2020 Adobe); see THIRD_PARTY_NOTICES.md.
type NavigatorUAData = Navigator & {
  userAgentData?: { platform?: string; brands?: { brand: string }[] };
};

const platformName = (): string => {
  if (typeof navigator === "undefined") return "";
  const { userAgentData, platform } = navigator as NavigatorUAData;
  return userAgentData?.platform || platform;
};

const testUserAgent = (pattern: RegExp): boolean => {
  if (typeof navigator === "undefined") return false;
  const { userAgentData, userAgent } = navigator as NavigatorUAData;
  return (
    (userAgentData?.brands?.some(({ brand }) => pattern.test(brand)) ?? false) ||
    pattern.test(userAgent)
  );
};

/** macOS or iOS, where ⌘ takes the part Ctrl plays elsewhere. */
export const isMacPlatform = (): boolean => /mac|iphone|ipad|ipod/i.test(platformName());

/** iPhone or iPad, including an iPad that reports itself as a Mac. */
export const isIOS = (): boolean =>
  /^(iPhone|iPad)/i.test(platformName()) ||
  (/^Mac/i.test(platformName()) && navigator.maxTouchPoints > 1);

/** A WebKit browser: Safari, or any browser on iOS. */
export const isWebKit = (): boolean =>
  testUserAgent(/AppleWebKit/i) && (isIOS() || !testUserAgent(/Chrome|CriOS|CrMo/i));

/** Safari on macOS or iOS, which leaves a checkbox or radio unfocused when its label is clicked. */
export const isSafari = (): boolean => isMacPlatform() && /apple/i.test(navigator.vendor);
