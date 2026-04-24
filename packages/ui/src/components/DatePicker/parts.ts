import { DatePicker as ArkDatePicker } from "@ark-ui/react/date-picker";
import { ark } from "@ark-ui/react/factory";
import { createStyleContext } from "@b3/styled-system/jsx";
import { datePicker } from "@b3/styled-system/recipes";

const { withRootProvider, withContext } = createStyleContext(datePicker);

export const RootProvider = withRootProvider(ArkDatePicker.RootProvider, {
  defaultProps: { unmountOnExit: true, lazyMount: true },
});
export const Content = withContext(ArkDatePicker.Content, "content");
export const Control = withContext(ArkDatePicker.Control, "control");
export const Trigger = withContext(ArkDatePicker.Trigger, "trigger");
export const Positioner = withContext(ArkDatePicker.Positioner, "positioner");
export const View = withContext(ArkDatePicker.View, "view");
export const ViewControl = withContext(ark.div, "viewControl");
export const ViewTrigger = withContext(ArkDatePicker.ViewTrigger, "viewTrigger");
export const PrevTrigger = withContext(ArkDatePicker.PrevTrigger, "prevTrigger");
export const NextTrigger = withContext(ArkDatePicker.NextTrigger, "nextTrigger");
export const RangeText = withContext(ArkDatePicker.RangeText, "rangeText");
export const Table = withContext(ArkDatePicker.Table, "table");
export const TableHead = withContext(ArkDatePicker.TableHead, "tableHead");
export const TableRow = withContext(ArkDatePicker.TableRow, "tableRow");
export const TableHeader = withContext(ArkDatePicker.TableHeader, "tableHeader");
export const TableBody = withContext(ArkDatePicker.TableBody, "tableBody");
export const TableCell = withContext(ArkDatePicker.TableCell, "tableCell");
export const TableCellTrigger = withContext(ArkDatePicker.TableCellTrigger, "tableCellTrigger");
export const PresetTrigger = withContext(ArkDatePicker.PresetTrigger, "presetTrigger");
export const Root = withContext(ark.div, "root");

export { ArkDatePicker };
