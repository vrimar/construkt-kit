type Props = Record<string, unknown>;
type PropsInput<P extends object> = P | ((merged: P) => P) | undefined;

// Later defined props win, but handlers chain and classNames join with the later one first; refs aren't merged.
export function mergeProps<P extends object>(...inputs: PropsInput<P>[]): P {
  let merged: Props = {};
  for (const input of inputs) {
    if (typeof input === "function") merged = { ...(input(merged as P) as Props) };
    else if (input) mergeInto(merged, input as unknown as Props);
  }
  return merged as P;
}

function mergeInto(merged: Props, props: Props) {
  for (const name in props) {
    const value = props[name];
    if (name === "style") {
      merged.style = mergeStyles(merged.style as object | undefined, value as object | undefined);
    } else if (name === "className") {
      merged.className = mergeClassNames(merged.className as string, value as string);
    } else if (isEventHandler(name, value)) {
      merged[name] = chainHandlers(merged[name] as Handler | undefined, value);
    } else if (value !== undefined) {
      merged[name] = value;
    }
  }
}

type Handler = (...args: unknown[]) => unknown;

function isEventHandler(name: string, value: unknown): value is Handler | undefined {
  const third = name.charCodeAt(2);
  return (
    name.startsWith("on") &&
    third >= 65 &&
    third <= 90 &&
    (typeof value === "function" || value === undefined)
  );
}

function chainHandlers(ours: Handler | undefined, theirs: Handler | undefined) {
  if (!theirs) return ours;
  if (!ours) return theirs;
  return (...args: unknown[]) => {
    const result = theirs(...args);
    ours(...args);
    return result;
  };
}

function mergeStyles(ours: object | undefined, theirs: object | undefined) {
  if (!theirs) return ours;
  if (!ours) return theirs;
  return { ...ours, ...theirs };
}

function mergeClassNames(ours: string | undefined, theirs: string | undefined) {
  if (!theirs) return ours;
  if (!ours) return theirs;
  return `${theirs} ${ours}`;
}
