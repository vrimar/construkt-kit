import { useLayoutEffect, useRef } from "react";

export const useAutoFocus = (select: boolean = false) => {
  const inputRef = useRef<any>(null);

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();

      if (select) inputRef.current.select();
    }
  }, [select]);

  return inputRef;
};
