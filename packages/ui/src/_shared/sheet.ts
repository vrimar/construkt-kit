import { SHEET_FRAME_ATTRIBUTE } from "../components/Sheet/sheetFrame";

/** The phone sheet `element` shows in, or `null` when it shows anchored or in place. */
export const sheetOf = (element: Element | null | undefined): Element | null =>
  element?.closest(`[${SHEET_FRAME_ATTRIBUTE}]`) ?? null;

/** The phone sheet in the document while it is open or animating out, else `null`. */
export const mountedSheet = (): Element | null =>
  document.querySelector(`[${SHEET_FRAME_ATTRIBUTE}]`);
