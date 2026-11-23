import type { Locator } from "@playwright/test";

/** A file to drop, in the shape `setInputFiles` takes. */
export interface DroppedFile {
  name: string;
  mimeType: string;
  buffer: Buffer;
}

/**
 * Drops `files` on a `FileUpload.Dropzone`: `target` is the dropzone or anything inside it. No
 * browser lets a test drag real files from the OS, so this dispatches `dragenter`, `dragover` and
 * `drop` carrying a synthetic `DataTransfer`; it checks what the dropzone does with files, not the
 * browser's drag gesture.
 */
export async function dropFiles(target: Locator, files: readonly DroppedFile[]): Promise<void> {
  const dataTransfer = await target.page().evaluateHandle(
    (payloads) => {
      const transfer = new DataTransfer();
      for (const { name, mimeType, base64 } of payloads) {
        const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
        transfer.items.add(new File([bytes], name, { type: mimeType }));
      }
      return transfer;
    },
    files.map(({ name, mimeType, buffer }) => ({
      name,
      mimeType,
      base64: buffer.toString("base64"),
    })),
  );
  try {
    for (const type of ["dragenter", "dragover", "drop"]) {
      await target.dispatchEvent(type, { dataTransfer });
    }
  } finally {
    await dataTransfer.dispose();
  }
}
