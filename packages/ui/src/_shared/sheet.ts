import { SHEET_FRAME_ATTRIBUTE } from "../components/Sheet/sheetFrame";

/** The phone sheet `element` shows in, or `null` when it shows anchored or in place. */
export const sheetOf = (element: Element | null | undefined): Element | null =>
  element?.closest(`[${SHEET_FRAME_ATTRIBUTE}]`) ?? null;
