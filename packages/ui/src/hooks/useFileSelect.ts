import { useCallback, useEffect, useRef } from "react";

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

export const useFileSelect = <TMultiple extends boolean = false>(
  options: UseFileUploadOptions<TMultiple> = {},
) => {
  const optionsRef = useRef(options);
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      for (const url of urlsRef.current) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  return useCallback(() => {
    const { accept = "", multiple = false, onSelect } = optionsRef.current;

    const input = createInput({ accept, multiple });

    input.onchange = () => {
      if (!input.files) return;

      for (const url of urlsRef.current) {
        URL.revokeObjectURL(url);
      }

      const parsed: ParsedFile[] = Array.from(input.files).map((file) => ({
        source: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        file,
      }));

      urlsRef.current = parsed.map((p) => p.source);

      if (multiple) {
        (onSelect as (files: ParsedFile[]) => void)?.(parsed);
      } else {
        (onSelect as (file: ParsedFile | null) => void)?.(parsed[0] ?? null);
      }

      input.value = "";
      input.remove();
    };

    input.click();
  }, []);
};
