import { useCallback } from "react";

import { useLatestRef } from "./useLatestRef";

export interface ParsedFile {
  /** Object URL for `file`; the consumer owns it and must call `URL.revokeObjectURL` when done. */
  source: string;
  name: string;
  size: number;
  file: File;
}

export interface UseFileUploadOptions<TMultiple extends boolean = false> {
  accept?: string;
  multiple?: TMultiple;
  onSelect?: (files: TMultiple extends true ? ParsedFile[] : ParsedFile | null) => void;
}

function createInput({
  accept,
  multiple,
}: {
  accept: string;
  multiple: boolean;
}): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.multiple = multiple;
  input.hidden = true;
  return input;
}

export const useFileSelect = <TMultiple extends boolean = false>(
  options: UseFileUploadOptions<TMultiple> = {},
) => {
  const optionsRef = useLatestRef(options);

  return useCallback(() => {
    const { accept = "", multiple = false, onSelect } = optionsRef.current;

    const input = createInput({ accept, multiple });

    input.onchange = () => {
      input.remove();
      if (!input.files) return;

      const parsed: ParsedFile[] = Array.from(input.files).map((file) => ({
        source: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        file,
      }));

      if (multiple) {
        (onSelect as (files: ParsedFile[]) => void)?.(parsed);
      } else {
        (onSelect as (file: ParsedFile | null) => void)?.(parsed[0] ?? null);
      }
    };
    input.oncancel = () => input.remove();

    document.body.append(input);
    input.click();
  }, [optionsRef]);
};
