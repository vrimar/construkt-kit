import { DatePicker as ArkDatePicker } from "@ark-ui/react/date-picker";
import { ark } from "@ark-ui/react/factory";
import type { ComponentProps, ReactElement } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { datePicker } from "#styled-system/recipes";

import { namedByContent } from "../namedByContent";
import { lazyOverlayDefaults } from "../overlayDefaults";

const { withProvider, withContext } = createSlotRecipeContext(datePicker);

export const RootProvider = withProvider(ArkDatePicker.RootProvider, "root", {
  defaultProps: lazyOverlayDefaults,
});
export const Content = withContext(ArkDatePicker.Content, "content");
export const Control = withContext(ArkDatePicker.Control, "control");
export const Trigger = namedByContent(withContext(ArkDatePicker.Trigger, "trigger"));
export const Positioner = withContext(ArkDatePicker.Positioner, "positioner");
export const View = withContext(ArkDatePicker.View, "view");
export const ViewControl = withContext(ark.div, "viewControl");
export const ViewTrigger = namedByContent(withContext(ArkDatePicker.ViewTrigger, "viewTrigger"));
export const PrevTrigger = withContext(ArkDatePicker.PrevTrigger, "prevTrigger");
export const NextTrigger = withContext(ArkDatePicker.NextTrigger, "nextTrigger");
export const Table = withContext(ArkDatePicker.Table, "table");
export const TableHead = withContext(ArkDatePicker.TableHead, "tableHead");
export const TableRow = withContext(ArkDatePicker.TableRow, "tableRow");
export const TableHeader = withContext(ArkDatePicker.TableHeader, "tableHeader");
export const TableBody = withContext(ArkDatePicker.TableBody, "tableBody");
export const TableCell = withContext(ArkDatePicker.TableCell, "tableCell");
export const TableCellTrigger = withContext(ArkDatePicker.TableCellTrigger, "tableCellTrigger");
const StyledPresetTrigger = withContext(ArkDatePicker.PresetTrigger, "presetTrigger");
export const PresetTrigger: (props: ComponentProps<typeof StyledPresetTrigger>) => ReactElement =
  namedByContent(StyledPresetTrigger);
export const ClearTrigger = namedByContent(withContext(ArkDatePicker.ClearTrigger, "clearTrigger"));
