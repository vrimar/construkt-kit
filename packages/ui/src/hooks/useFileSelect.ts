export interface ParsedFile {
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

import { useCallback, useRef } from "react";

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
  return input;
}

export function useFileSelect<TMultiple extends boolean = false>(
  options: UseFileUploadOptions<TMultiple> = {},
) {
  const optionsRef = useRef(options);

  return useCallback(() => {
    const { accept = "", multiple = false, onSelect } = optionsRef.current;

    const input = createInput({ accept, multiple });

    input.onchange = () => {
      if (!input.files) return;

      const parsed: ParsedFile[] = Array.from(input.files).map((file) => ({
        source: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        file,
      }));

      if (multiple) {
        onSelect?.(parsed as any);
      } else {
        onSelect?.((parsed[0] ?? null) as any);
      }

      input.value = "";
      input.remove();
    };

    input.click();
  }, []);
}
