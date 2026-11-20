import { createSlotRecipeContext } from "#styled-system/jsx";
import { datePicker } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";
import { createPickerContent } from "../pickerPopup";

const { withProvider, withContext } = createSlotRecipeContext(datePicker);

export const Root = withProvider(renderable.div, "root");
export const Control = withContext(renderable.div, "control");
export const Trigger = withContext(renderable.button, "trigger");
export const Content = createPickerContent(
  withContext(renderable.div, "positioner"),
  withContext(renderable.div, "content"),
);
export const View = withContext(renderable.div, "view");
export const ViewControl = withContext(renderable.div, "viewControl");
export const ViewTrigger = withContext(renderable.button, "viewTrigger");
export const PrevTrigger = withContext(renderable.button, "prevTrigger");
export const NextTrigger = withContext(renderable.button, "nextTrigger");
export const Table = withContext(renderable.table, "table");
export const TableHead = withContext(renderable.thead, "tableHead");
export const TableRow = withContext(renderable.tr, "tableRow");
export const TableHeader = withContext(renderable.th, "tableHeader");
export const TableBody = withContext(renderable.tbody, "tableBody");
export const TableCell = withContext(renderable.td, "tableCell");
export const TableCellTrigger = withContext(renderable.button, "tableCellTrigger");
export const PresetTrigger = withContext(renderable.button, "presetTrigger");
export const ClearTrigger = withContext(renderable.button, "clearTrigger");
