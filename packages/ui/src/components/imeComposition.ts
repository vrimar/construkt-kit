import type { KeyboardEvent as ReactKeyboardEvent } from "react";

export function isComposingEvent(event: KeyboardEvent | ReactKeyboardEvent) {
  const native = "nativeEvent" in event ? event.nativeEvent : event;
  // WebKit sends the IME-confirming keydown with isComposing false but keyCode 229.
  return native.isComposing || native.keyCode === 229;
}
