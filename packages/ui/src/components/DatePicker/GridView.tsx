import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { HStack } from "#styled-system/jsx";

import { Button, IconButton } from "../Buttons";
import type { DateView } from "./dateUtils";
import * as Parts from "./parts";
import { useCalendarContext } from "./useCalendar";

const ViewTrigger = ({ view, text }: { view: DateView; text: string }) => (
  <Parts.ViewTrigger
    {...useCalendarContext().getViewTriggerProps(view)}
    render={<Button fontWeight="bold" />}
  >
    {text}
  </Parts.ViewTrigger>
);

export const DatePickerViewControl = ({
  view,
  endLabel,
}: {
  view: DateView;
  endLabel?: boolean;
}) => {
  const calendar = useCalendarContext();

  return (
    <Parts.ViewControl data-view={view}>
      <HStack>
        <Parts.PrevTrigger
          {...calendar.getStepTriggerProps(-1, view)}
          render={<IconButton />}
        >
          <ChevronLeftIcon />
        </Parts.PrevTrigger>
        <ViewTrigger
          view={view}
          text={calendar.visibleRangeText.start}
        />
      </HStack>

      {endLabel && (
        <ViewTrigger
          view={view}
          text={calendar.visibleRangeText.end}
        />
      )}

      <Parts.NextTrigger
        {...calendar.getStepTriggerProps(1, view)}
        render={<IconButton />}
      >
        <ChevronRightIcon />
      </Parts.NextTrigger>
    </Parts.ViewControl>
  );
};

export const DatePickerGridView = ({ view }: { view: "month" | "year" }) => {
  const calendar = useCalendarContext();
  const grid = view === "month" ? calendar.monthsGrid() : calendar.yearsGrid();

  return (
    <Parts.View data-view={view}>
      <DatePickerViewControl view={view} />
      <Parts.Table {...calendar.getTableProps(view, 4)}>
        <Parts.TableBody>
          {grid.map((row, rowIndex) => (
            <Parts.TableRow
              key={rowIndex}
              {...calendar.getRowProps()}
            >
              {row.map((cell) => {
                const state = calendar.getGridCell(view, cell.value);
                return (
                  <Parts.TableCell
                    key={cell.value}
                    {...calendar.getGridCellProps(state)}
                  >
                    <Parts.TableCellTrigger
                      {...calendar.getGridTriggerProps(state, view)}
                      render={<Button />}
                    >
                      {cell.label}
                    </Parts.TableCellTrigger>
                  </Parts.TableCell>
                );
              })}
            </Parts.TableRow>
          ))}
        </Parts.TableBody>
      </Parts.Table>
    </Parts.View>
  );
};
