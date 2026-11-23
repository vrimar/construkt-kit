import type { GlobalVarsDefinition } from "@pandacss/types";

// Panda drops an @property registration the stylesheet never writes; the parts JS writes on restate the initial values.
export const initialValues = (vars: GlobalVarsDefinition, names: readonly string[]) =>
  Object.fromEntries(
    names.map((name) => {
      const definition = vars[name];
      return [name, typeof definition === "string" ? definition : definition?.initialValue];
    }),
  );
