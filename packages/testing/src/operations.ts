/** One API operation, as `construkt-kit-api-gen` lists them in `gen/operations.ts`. */
export interface ApiOperation {
  method: string;
  /** The OpenAPI path template, such as `/api/variables/{id}`. */
  path: string;
  operationId?: string;
  /** GET, HEAD and OPTIONS read; any other method writes unless the spec marks it `x-read-only`. */
  read: boolean;
}

export interface OperationTable {
  /** The operation a request is, by method and URL path; undefined when no template matches. */
  find(method: string, pathname: string): ApiOperation | undefined;
}

const PARAM = /\{[^}]+\}/g;

const escape = (text: string) => text.replace(/[.*+?^$()|[\]\\]/g, "\\$&");

/** Matches literal templates before parameterised ones, so `/items/search` beats `/items/{id}`. */
export function operationTable(operations: readonly ApiOperation[]): OperationTable {
  const entries = operations
    .map((operation) => ({
      operation,
      params: operation.path.match(PARAM)?.length ?? 0,
      pattern: new RegExp(`^${operation.path.split(PARAM).map(escape).join("[^/]+")}/?$`),
    }))
    .sort((a, b) => a.params - b.params);

  return {
    find(method, pathname) {
      const upper = method.toUpperCase();
      return entries.find(
        ({ operation, pattern }) => operation.method === upper && pattern.test(pathname),
      )?.operation;
    },
  };
}
