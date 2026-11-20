import preview from "@construkt-kit/story-kit/preview";
import { Badge, Box, Button, HStack, Text, type TextProps } from "@construkt-kit/ui";
import { useMemo, useRef, useState } from "react";
import { fn } from "storybook/test";

import { type FixtureRow, createFixture, moveIds } from "../../test/fixture";
import { DataGrid } from "./DataGrid";
import type {
  CellSpec,
  ColumnDef,
  DataGridApi,
  DataGridProps,
  DataGridState,
  DragHandleProps,
  DropIndicator,
  EntitySelection,
  ExternalDragEvent,
} from "./types";

const meta = preview.meta({
  title: "Data/DataGrid",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
});

interface Invoice {
  id: number;
  customer: string;
  region: string;
  status: "paid" | "open" | "overdue";
  amount: number;
  issued: string;
}

const CUSTOMERS = [
  "Acme Corporation",
  "Globex",
  "Initech",
  "Umbrella",
  "Hooli",
  "Stark Industries",
];
const REGIONS = ["North", "South", "East", "West"];
const STATUSES: Invoice["status"][] = ["paid", "open", "overdue"];

const invoices: Invoice[] = Array.from({ length: 2_000 }, (_, id) => ({
  id,
  customer: CUSTOMERS[id % CUSTOMERS.length],
  region: REGIONS[(id * 7) % REGIONS.length],
  status: STATUSES[(id * 5) % STATUSES.length],
  amount: Math.round(Math.sin(id) * 500_000) / 100,
  issued: new Date(Date.UTC(2026, 0, 1 + (id % 300))).toISOString().slice(0, 10),
}));

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const STATUS_PALETTE = { paid: "success", open: "info", overdue: "danger" } as const;

const invoiceColumns: ColumnDef<Invoice>[] = [
  { id: "id", header: "#", field: "id", width: 80 },
  {
    id: "customer",
    header: "Customer",
    field: "customer",
    width: 200,
    cell: { tooltip: ({ value, row }) => `${String(value)} — invoice ${row.id + 1}` },
  },
  { id: "region", header: "Region", field: "region" },
  {
    id: "status",
    header: "Status",
    field: "status",
    cell: {
      render: ({ row }) => (
        <Badge
          size="sm"
          colorPalette={STATUS_PALETTE[row.status]}
        >
          {row.status}
        </Badge>
      ),
    },
  },
  {
    id: "amount",
    header: "Amount",
    field: "amount",
    width: 140,
    cell: { format: (value) => currency.format(value as number) },
  },
  { id: "issued", header: "Issued", field: "issued", width: 130 },
];

const invoiceGrid = {
  rows: invoices,
  getRowId: (row: Invoice) => row.id,
  columnDefs: invoiceColumns,
};

const negativeAmounts = ({ columnId, value }: { columnId: string; value: unknown }) =>
  columnId === "amount" && (value as number) < 0
    ? ({ tone: "danger" } satisfies CellSpec<Invoice>)
    : undefined;

export const Basic = meta.story({
  render: () => (
    <DataGrid
      {...invoiceGrid}
      getCell={negativeAmounts}
      aria-label="Invoices"
      height="480px"
      toolbar={<Text textStyle="sm">Invoices</Text>}
      statusBar={<Text>{invoices.length.toLocaleString("en-US")} invoices</Text>}
    />
  ),
});

function FixtureStory({
  shape: [rowCount, columnCount],
  ...props
}: Omit<DataGridProps<FixtureRow>, "rows" | "getRowId" | "columnDefs"> & {
  shape: [rowCount: number, columnCount: number];
}) {
  const fixture = useMemo(() => createFixture(rowCount, columnCount), [rowCount, columnCount]);
  return (
    <DataGrid
      {...fixture}
      {...props}
    />
  );
}

export const LargeDataset = meta.story({
  name: "100k rows × 200 columns",
  render: () => (
    <FixtureStory
      shape={[100_000, 200]}
      aria-label="Large dataset"
      height="80vh"
    />
  ),
});

export const TallContent = meta.story({
  name: "Content past 15M px",
  render: () => (
    <FixtureStory
      shape={[100_000, 6]}
      getRowHeight={() => 200}
      aria-label="Tall rows"
      height="80vh"
    />
  ),
});

export const Density = meta.story({
  render: () => (
    <HStack
      alignItems="start"
      gap="4"
    >
      {(["compact", "default", "relaxed"] as const).map((density) => (
        <Box
          key={density}
          data-density={density}
          flex="1"
          minWidth="0"
        >
          <Text
            textStyle="sm"
            mb="2"
          >
            {density}
          </Text>
          <DataGrid
            {...invoiceGrid}
            aria-label={`Invoices, ${density}`}
            height="360px"
          />
        </Box>
      ))}
    </HStack>
  ),
});

export const Variants = meta.story({
  render: () => (
    <DataGrid
      {...invoiceGrid}
      aria-label="Striped invoices"
      size="sm"
      striped
      gridLines="rows"
      height="360px"
    />
  ),
});

function EmptyAndLoadingStory() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const load = () => {
    setLoading(true);
    setTimeout(() => {
      setRows(invoices.slice(0, 50));
      setLoading(false);
    }, 1500);
  };
  return (
    <DataGrid
      {...invoiceGrid}
      rows={rows}
      loading={loading}
      aria-label="Invoices"
      height="360px"
      toolbar={
        <HStack gap="2">
          <Button
            size="sm"
            onClick={load}
          >
            Load
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRows([])}
          >
            Clear
          </Button>
        </HStack>
      }
    />
  );
}

export const EmptyAndLoading = meta.story({
  render: () => <EmptyAndLoadingStory />,
});

export const Phone = meta.story({
  tags: ["phone-only"],
  globals: { viewport: { value: "mobile2" } },
  render: () => (
    <DataGrid
      {...invoiceGrid}
      aria-label="Invoices"
      height="70vh"
    />
  ),
});

interface Respondent {
  id: number;
  question: string;
  counts: number[];
}

const POINTS = ["Male", "Female", "18–34", "35–54", "55+", "North", "South", "East", "West"];
const crosstabRows: Respondent[] = Array.from({ length: 60 }, (_, id) => ({
  id,
  question: `Q${Math.floor(id / 5) + 1}. Answer ${(id % 5) + 1}`,
  counts: POINTS.map((label, index) => ((id * 37 + index * 11 + label.length) % 90) + 5),
}));

const point = (index: number): ColumnDef<Respondent> => ({
  id: `p${index}`,
  header: POINTS[index],
  width: 90,
  getValue: (row) => row.counts[index],
  cell: { format: (value) => `${String(value)}%` },
});

const crosstabColumns: ColumnDef<Respondent>[] = [
  {
    id: "label",
    pinned: "left",
    rowHeader: true,
    width: 220,
    field: "question",
    header: () => <Text fontWeight="semibold">Question / Answer</Text>,
  },
  { id: "total", header: "Total", width: 90, getValue: () => 100, cell: { format: () => "100%" } },
  { id: "gender", header: "Gender", children: [point(0), point(1)] },
  { id: "age", header: "Age", children: [point(2), point(3), point(4)] },
  { id: "region", header: "Region", children: [point(5), point(6), point(7), point(8)] },
];

export const Crosstab = meta.story({
  render: () => (
    <DataGrid
      rows={crosstabRows}
      getRowId={(row) => row.id}
      columnDefs={crosstabColumns}
      headerHeight={[32, 56]}
      rowNumbers
      columnLetters
      aria-label="Crosstab"
      height="480px"
    />
  ),
});

const flexColumns: ColumnDef<Invoice>[] = [
  { id: "id", header: "#", field: "id", width: 80 },
  { id: "customer", header: "Customer", field: "customer", flex: 2, minWidth: 160 },
  { id: "region", header: "Region", field: "region", flex: 1, maxWidth: 180 },
  { id: "amount", header: "Amount", field: "amount", width: 140 },
];

export const FlexColumns = meta.story({
  render: () => (
    <DataGrid
      {...invoiceGrid}
      columnDefs={flexColumns}
      aria-label="Invoices with flexible columns"
      height="360px"
    />
  ),
});

function ColumnStateStory() {
  const apiRef = useRef<DataGridApi>(null);
  const [saved, setSaved] = useState<DataGridState | null>(null);
  const [state, setState] = useState<DataGridState | null>(null);
  return (
    <DataGrid
      {...invoiceGrid}
      apiRef={apiRef}
      onStateChange={setState}
      aria-label="Invoices"
      height="400px"
      toolbar={
        <HStack
          gap="2"
          flexWrap="wrap"
        >
          <Button
            size="sm"
            variant="outline"
            onClick={() => apiRef.current?.setColumnPinned("customer", "left")}
          >
            Pin customer
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => apiRef.current?.setColumnHidden("region", true)}
          >
            Hide region
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => apiRef.current?.autosizeColumns()}
          >
            Auto-size
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSaved(apiRef.current?.getState() ?? null)}
          >
            Save view
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!saved}
            onClick={() => saved && apiRef.current?.restoreState(saved)}
          >
            Restore view
          </Button>
        </HStack>
      }
      statusBar={<Text>{state ? JSON.stringify(state) : "Resize, pin or hide a column"}</Text>}
    />
  );
}

export const ColumnState = meta.story({
  render: () => <ColumnStateStory />,
});

interface Line {
  id: string;
  parent?: string;
  label: string;
  region: string;
  amount: number;
  section?: boolean;
}

const regionLines = (region: string, count: number): Line[] =>
  invoices
    .filter((invoice) => invoice.region === region)
    .slice(0, count)
    .map((invoice) => ({
      id: `${region}-${invoice.id}`,
      label: invoice.customer,
      region,
      amount: invoice.amount,
    }));

const treeLines: Line[] = REGIONS.flatMap((region) => {
  const children = regionLines(region, 25).map((line) => ({ ...line, parent: region }));
  return [
    {
      id: region,
      label: region,
      region,
      amount: children.reduce((sum, line) => sum + line.amount, 0),
    },
    ...children,
  ];
});

const treeColumns: ColumnDef<Line>[] = [
  {
    id: "label",
    header: "Region / customer",
    field: "label",
    rowHeader: true,
    width: 260,
    pinned: "left",
  },
  { id: "region", header: "Region", field: "region", rowSpan: "sameValue" },
  {
    id: "amount",
    header: "Amount",
    field: "amount",
    width: 140,
    cell: { format: (value) => currency.format(value as number) },
  },
  ...Array.from({ length: 12 }, (_, month) => ({
    id: `m${month}`,
    header: new Date(2026, month, 1).toLocaleString("en-US", { month: "short" }),
    width: 90,
    getValue: (row: Line) => Math.round(row.amount / 12),
  })),
];

const totals = (label: string): Line => ({
  id: label,
  label,
  region: "",
  amount: treeLines.filter((line) => line.parent).reduce((sum, line) => sum + line.amount, 0),
});

export const TreeRows = meta.story({
  render: () => (
    <DataGrid
      rows={treeLines}
      getRowId={(row) => row.id}
      getParentId={(row) => row.parent}
      defaultExpandedRowIds={REGIONS}
      columnDefs={treeColumns}
      pinnedTopRows={[totals("Total")]}
      pinnedBottomRows={[totals("Grand total")]}
      rowNumbers
      aria-label="Invoices by region"
      height="520px"
    />
  ),
});

const sectionLines: Line[] = REGIONS.flatMap((region) => [
  { id: `section-${region}`, label: region, region, amount: 0, section: true },
  ...regionLines(region, 15),
]);

export const FullWidthSections = meta.story({
  render: () => (
    <DataGrid
      rows={sectionLines}
      getRowId={(row) => row.id}
      columnDefs={treeColumns}
      isFullWidthRow={(row) => row.section === true}
      renderFullWidthRow={({ row }) => <Text fontWeight="semibold">{row.label}</Text>}
      aria-label="Invoices in sections"
      height="480px"
    />
  ),
});

const selectionColumns = (api: DataGridApi | null): ColumnDef<Invoice>[] =>
  invoiceColumns.map((column) => ({
    ...column,
    menu: ({ ids }) => [
      {
        id: "hide",
        label: ids.length > 1 ? `Hide ${ids.length} columns` : "Hide column",
        onSelect: () => {
          for (const id of ids) api?.setColumnHidden(id, true);
        },
      },
      {
        id: "pin",
        label: "Pin",
        items: [
          {
            id: "left",
            label: "Left",
            onSelect: () => api?.setColumnPinned(column.id, "left"),
          },
          {
            id: "right",
            label: "Right",
            onSelect: () => api?.setColumnPinned(column.id, "right"),
          },
          { type: "separator" },
          {
            id: "none",
            label: "Unpin",
            onSelect: () => api?.setColumnPinned(column.id, false),
          },
        ],
      },
      { id: "fit", label: "Fit width", onSelect: () => api?.autosizeColumns(ids) },
    ],
    cell: {
      ...column.cell,
      menu: ({ rowIds, ranges }) => [
        {
          id: "copy",
          label: "Copy",
          hint: "Ctrl C",
          onSelect: () => void api?.copy(),
        },
        {
          id: "flash",
          label: rowIds.length > 1 ? `Flash ${rowIds.length} rows` : "Flash row",
          onSelect: () => api?.flash({ rows: rowIds, kind: "success" }),
        },
        { type: "separator" },
        {
          id: "delete",
          label: `Delete ${ranges.length > 1 ? "ranges" : "range"}`,
          destructive: true,
        },
      ],
    },
  }));

function SelectionDemo() {
  const [api, setApi] = useState<DataGridApi | null>(null);
  const [selection, setSelection] = useState<EntitySelection | null>(null);
  const [ended, setEnded] = useState(0);
  const columns = useMemo(() => selectionColumns(api), [api]);
  return (
    <DataGrid
      {...invoiceGrid}
      columnDefs={columns}
      apiRef={setApi}
      checkboxSelection
      rowNumbers
      selection={selection}
      onSelectionChange={setSelection}
      onSelectionEnd={() => setEnded((count) => count + 1)}
      isRowSelectable={(row) => row.status !== "paid"}
      toolbar={
        <HStack gap="2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              api?.flash({ cells: [{ rowId: 3, columnId: "amount" }], kind: "warning" })
            }
          >
            Flash a cell
          </Button>
          <Text textStyle="sm">
            {selection
              ? `${selection.ids.length} ${selection.ids.length === 1 ? selection.kind.slice(0, -1) : selection.kind} selected`
              : "Nothing selected"}
          </Text>
        </HStack>
      }
      statusBar={({ stats }) => (
        <HStack gap="4">
          <span>Selections finished: {ended}</span>
          {stats && <span>Count {stats.count}</span>}
          {stats?.average != null && <span>Average {currency.format(stats.average)}</span>}
          {stats && stats.numericCount > 0 && <span>Sum {currency.format(stats.sum)}</span>}
        </HStack>
      )}
      aria-label="Selection"
      height="480px"
    />
  );
}

export const Selection = meta.story({
  render: () => <SelectionDemo />,
});

interface Answer {
  id: string;
  label: string;
  share: number;
  base: number;
}

const ANSWERS: Answer[] = [
  "Male",
  "Female",
  "18-34",
  "35-54",
  "55+",
  "North",
  "South",
  "Urban",
].map((label, index) => ({
  id: label,
  label,
  share: 10 + ((index * 37) % 60),
  base: 200 + index * 41,
}));

const EXTRA_ANSWERS = ["East", "West", "Rural", "Students"];

function GripLabel({ handle, ...text }: TextProps & { handle: DragHandleProps | undefined }) {
  return (
    <HStack gap="1.5">
      {handle && <span {...handle}>⠿</span>}
      <Text
        truncate
        {...text}
      />
    </HStack>
  );
}

const labelColumn = <TRow extends { label: string }>(
  header: string,
  width: number,
  cell?: CellSpec<TRow>,
): ColumnDef<TRow> => ({
  id: "label",
  header,
  getValue: (row) => row.label,
  width,
  pinned: "left",
  rowHeader: true,
  reorderable: false,
  cell: {
    ...cell,
    render: (ctx) => <GripLabel handle={ctx.dragHandleProps}>{ctx.formattedValue}</GripLabel>,
  },
});

function ReorderDemo() {
  const [api, setApi] = useState<DataGridApi | null>(null);
  const [answers, setAnswers] = useState(ANSWERS);
  const [columnOrder, setColumnOrder] = useState(["share", "base"]);
  const [headers, setHeaders] = useState<Record<string, string>>({
    share: "Share %",
    base: "Base",
  });
  const [indicator, setIndicator] = useState<DropIndicator | null>(null);
  const [extras, setExtras] = useState(EXTRA_ANSWERS);
  const dragged = useRef<string | null>(null);

  const columns: ColumnDef<Answer>[] = [
    labelColumn("Answer", 220, { editable: true }),
    ...columnOrder.map((id): ColumnDef<Answer> => ({
      id,
      field: id as "share" | "base",
      width: 140,
      headerText: headers[id],
      headerEditable: true,
      header: (ctx) => <GripLabel handle={ctx.dragHandleProps}>{headers[id]}</GripLabel>,
    })),
  ];

  const externalTarget = ({ hit }: ExternalDragEvent): DropIndicator | null =>
    hit?.region === "body" && hit.rowId !== null
      ? { kind: "rows", id: hit.rowId, position: hit.fractionY < 0.5 ? "before" : "after" }
      : null;

  return (
    <HStack
      gap="4"
      alignItems="stretch"
    >
      <Box
        display="flex"
        flexDirection="column"
        gap="2"
        width="10rem"
      >
        <Text
          textStyle="sm"
          color="fg.muted"
        >
          Drag into the grid
        </Text>
        {extras.map((label) => (
          <Badge
            key={label}
            draggable
            cursor="grab"
            onDragStart={(event) => {
              dragged.current = label;
              event.dataTransfer.setData("text/plain", label);
            }}
          >
            {label}
          </Badge>
        ))}
      </Box>
      <DataGrid
        rows={answers}
        getRowId={(row) => row.id}
        columnDefs={columns}
        apiRef={setApi}
        rowNumbers
        indicator={indicator}
        canDropOnto={(source) => source.kind === "rows"}
        onRowsDrop={({ ids, targetId, position }) => {
          if (position !== "onto") {
            setAnswers((rows) => moveIds(rows, (row) => row.id, ids, targetId, position));
            return;
          }
          setAnswers((rows) => {
            const merged = rows.filter((row) => ids.includes(row.id)).map((row) => row.label);
            return rows
              .filter((row) => !ids.includes(row.id))
              .map((row) =>
                row.id === targetId ? { ...row, label: [row.label, ...merged].join(" or ") } : row,
              );
          });
          api?.flash({ rows: [targetId], kind: "success" });
        }}
        onColumnsDrop={({ ids, targetId, position }) => {
          if (position === "onto") return;
          setColumnOrder((order) => moveIds(order, (id) => id, ids, targetId, position));
        }}
        onCellsChange={(changes) =>
          setAnswers((rows) =>
            rows.map((row) => {
              const change = changes.find((candidate) => candidate.rowId === row.id);
              return change ? { ...row, label: String(change.value) } : row;
            }),
          )
        }
        onHeaderRename={({ columnId, name }) =>
          setHeaders((current) => ({ ...current, [columnId]: name }))
        }
        onExternalDragOver={(event) => {
          const next = externalTarget(event);
          setIndicator((current) =>
            current?.id === next?.id && current?.position === next?.position ? current : next,
          );
          return next !== null;
        }}
        onExternalDragLeave={() => setIndicator(null)}
        onExternalDrop={(event) => {
          const target = externalTarget(event);
          const label = dragged.current;
          setIndicator(null);
          if (!target || !label || target.position === "onto") return;
          const { id, position } = target;
          const row: Answer = { id: label, label, share: 0, base: 0 };
          setAnswers((rows) => moveIds([...rows, row], (item) => item.id, [label], id, position));
          setExtras((items) => items.filter((item) => item !== label));
          api?.flash({ rows: [label], kind: "success" });
        }}
        aria-label="Reorder"
        height="420px"
        flex="1"
      />
    </HStack>
  );
}

export const Reorder = meta.story({
  render: () => <ReorderDemo />,
});

interface Survey {
  id: string;
  parent?: string;
  label: string;
  section?: boolean;
  counts: Record<string, number>;
}

const SURVEY_POINTS = ["male", "female", "young", "older"];

const surveyRows: Survey[] = [
  { id: "demographics", label: "Demographics", section: true, counts: {} },
  ...["Q1. Age", "Q2. Region", "Q3. Income"].flatMap((question, q) => [
    { id: `q${q}`, label: question, counts: {} },
    ...["Answer A", "Answer B", "Answer C"].map((answer, a) => ({
      id: `q${q}a${a}`,
      parent: `q${q}`,
      label: answer,
      counts: Object.fromEntries(
        SURVEY_POINTS.map((segment, p) => [segment, ((q * 31 + a * 17 + p * 7) % 80) + 10]),
      ),
    })),
  ]),
  { id: "attitudes", label: "Attitudes", section: true, counts: {} },
  { id: "q3", label: "Q4. Satisfaction", counts: {} },
  {
    id: "q3a0",
    parent: "q3",
    label: "Satisfied",
    counts: { male: 40, female: 52, young: 44, older: 48 },
  },
  {
    id: "q3a1",
    parent: "q3",
    label: "Unsatisfied",
    counts: { male: 60, female: 48, young: 56, older: 52 },
  },
];

interface ColumnNode {
  id: string;
  label: string;
  children?: ColumnNode[];
}

const SURVEY_COLUMNS: ColumnNode[] = [
  {
    id: "gender",
    label: "Gender",
    children: [
      { id: "male", label: "Male" },
      { id: "female", label: "Female" },
    ],
  },
  {
    id: "age",
    label: "Age",
    children: [
      { id: "young", label: "18–34" },
      { id: "older", label: "35+" },
    ],
  },
];

function moveColumnNodes(
  nodes: readonly ColumnNode[],
  ids: readonly string[],
  targetId: string,
  position: "before" | "after",
): ColumnNode[] {
  if (nodes.some((node) => node.id === targetId)) {
    return moveIds(nodes, (node) => node.id, ids, targetId, position);
  }
  return nodes.map((node) =>
    node.children
      ? { ...node, children: moveColumnNodes(node.children, ids, targetId, position) }
      : node,
  );
}

function ReorderTreeDemo() {
  const [rows, setRows] = useState(surveyRows);
  const [columns, setColumns] = useState(SURVEY_COLUMNS);
  const [selection, setSelection] = useState<EntitySelection | null>(null);
  const [lastDrop, setLastDrop] = useState("Drag a grip, or press Alt+Shift+Arrows");

  const header = (node: ColumnNode): ColumnDef<Survey>["header"] =>
    function SurveyHeader(ctx) {
      return <GripLabel handle={ctx.dragHandleProps}>{node.label}</GripLabel>;
    };
  const toDef = (node: ColumnNode): ColumnDef<Survey> =>
    node.children
      ? {
          id: node.id,
          header: header(node),
          headerText: node.label,
          children: node.children.map(toDef),
        }
      : {
          id: node.id,
          header: header(node),
          headerText: node.label,
          width: 110,
          getValue: (row) => row.counts[node.id],
          cell: { format: (value) => (typeof value === "number" ? `${value}%` : "") },
        };

  const columnDefs: ColumnDef<Survey>[] = [
    labelColumn("Question / answer", 240),
    ...columns.map(toDef),
  ];

  return (
    <DataGrid
      rows={rows}
      getRowId={(row) => row.id}
      getParentId={(row) => row.parent}
      defaultExpandedRowIds={["q0", "q1", "q2", "q3"]}
      isFullWidthRow={(row) => row.section === true}
      renderFullWidthRow={(ctx) => (
        <GripLabel
          handle={ctx.dragHandleProps}
          fontWeight="semibold"
          truncate={false}
        >
          {ctx.row.label}
        </GripLabel>
      )}
      columnDefs={columnDefs}
      checkboxSelection
      selection={selection}
      onSelectionChange={setSelection}
      canDropOnto={(source) => source.kind === "rows"}
      onRowsDrop={({ ids, targetId, position }) => {
        setLastDrop(`${ids.join(", ")} ${position} ${targetId}`);
        if (position === "onto") return;
        setRows((current) => moveIds(current, (row) => row.id, ids, targetId, position));
      }}
      onColumnsDrop={({ ids, targetId, position }) => {
        setLastDrop(`${ids.join(", ")} ${position} ${targetId}`);
        if (position === "onto") return;
        setColumns((current) => moveColumnNodes(current, ids, targetId, position));
      }}
      statusBar={<Text>{lastDrop}</Text>}
      aria-label="Survey"
      height="480px"
    />
  );
}

export const ReorderTree = meta.story({
  name: "Reorder tree and groups",
  render: () => <ReorderTreeDemo />,
});

export const CellTooltips = meta.story({
  render: () => (
    <Box
      data-story-scroll
      minHeight="[200vh]"
    >
      <DataGrid
        {...createFixture(6, 3)}
        defaultCell={{
          editable: true,
          tooltip: ({ formattedValue }) => `About ${formattedValue}`,
        }}
        aria-label="Cell tooltips"
        height="280px"
      />
    </Box>
  ),
});

function ColumnGroupsDemo({
  canDropOnto,
  onColumnsDrop,
}: Pick<DataGridProps<FixtureRow>, "canDropOnto" | "onColumnsDrop">) {
  const leaf = (id: string): ColumnDef<FixtureRow> => ({
    id,
    headerText: id,
    width: 120,
    header: (ctx) => <GripLabel handle={ctx.dragHandleProps}>{id}</GripLabel>,
    getValue: (row) => `${id}${row.id + 1}`,
  });
  return (
    <DataGrid
      {...createFixture(6, 0)}
      columnDefs={[
        { id: "g1", header: "Group 1", children: [leaf("a"), leaf("b")] },
        { id: "g2", header: "Group 2", children: [leaf("c"), leaf("d")] },
      ]}
      canDropOnto={canDropOnto}
      onColumnsDrop={onColumnsDrop}
      aria-label="Column groups"
      height="280px"
    />
  );
}

export const ColumnGroups = meta.story({
  args: { onColumnsDrop: fn() },
  render: (args) => <ColumnGroupsDemo onColumnsDrop={args.onColumnsDrop} />,
});

export const ColumnGroupsDropOnto = meta.story({
  name: "Column groups, drop onto a column",
  args: { onColumnsDrop: fn() },
  render: (args) => (
    <ColumnGroupsDemo
      canDropOnto={(source) => source.kind === "columns"}
      onColumnsDrop={args.onColumnsDrop}
    />
  ),
});
