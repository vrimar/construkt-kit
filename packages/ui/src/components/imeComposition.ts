import type { KeyboardEvent } from "react";

export function isComposingEvent(event: KeyboardEvent) {
  // WebKit sends the IME-confirming keydown with isComposing false but keyCode 229.
  return event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229;
}
