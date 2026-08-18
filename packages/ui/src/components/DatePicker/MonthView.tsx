import { DatePickerGridView } from "./GridView";

export const DatePickerMonthView = () => (
  <DatePickerGridView
    view="month"
    getGrid={(api) => api.getMonthsGrid({ columns: 4, format: "short" })}
  />
);
