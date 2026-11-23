import { createContext, useContext } from "react";

export function createPartContext<T>(owner: string, parts = "This part") {
  const Context = createContext<T | null>(null);
  const usePartContext = (part = parts): T => {
    const context = useContext(Context);
    if (context === null) throw new Error(`${part} must be placed inside ${owner}.`);
    return context;
  };
  return [Context, usePartContext] as const;
}
