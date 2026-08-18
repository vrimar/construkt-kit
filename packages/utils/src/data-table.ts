export type DataTableFilters = Record<string, string[] | undefined>;

export type DataTableSortType = "asc" | "desc" | "";

/** Paging/sorting/filtering contract shared by the table component and the HTTP client.
 *  The index signature carries app-specific filter keys through to the query string. */
export interface DataTableParams extends Record<string, any> {
  page: number;
  pageSize: number;
  orderBy: string;
  orderType: DataTableSortType;
  filters: DataTableFilters;
}
