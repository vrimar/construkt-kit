import { DatePickerGridView } from "./GridView";

export const DatePickerYearView = () => (
  <DatePickerGridView
    view="year"
    getGrid={(api) => api.getYearsGrid({ columns: 4 })}
  />
);
