import { isPlainObject } from "./object";

export function buildQueryString(object: unknown) {
  if (!isPlainObject(object)) return "";

  const args: string[] = [];

  for (const key in object) destructure(key, object[key]);

  function destructure(key: string, value: any) {
    if (Array.isArray(value)) {
      let index = 0;
      for (const item of value) {
        const count = args.length;
        destructure(key + "[" + index + "]", item);
        // ASP.NET binds indexes only up to the first gap.
        if (args.length > count) index++;
      }
    } else if (isPlainObject(value)) {
      for (const i in value) {
        destructure(key + "[" + i + "]", value[i]);
      }
    } else if (value instanceof Date) {
      if (!Number.isNaN(value.getTime())) destructure(key, value.toISOString());
    } else if (value != null && value !== "") {
      args.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
    }
  }

  return args.join("&");
}

/** Saves a blob under the name a `Content-Disposition` header carries, or `fallbackName`. */
export const saveBlob = (
  blob: Blob,
  contentDisposition?: string | null,
  fallbackName: string = "download",
) => {
  const url = window.URL.createObjectURL(blob);
  downloadFile(url, fileNameFromContentDisposition(contentDisposition) || fallbackName);
  // WebKit can cancel a download whose blob URL is revoked right after the click.
  setTimeout(() => window.URL.revokeObjectURL(url), 40_000);
};

/**
 * Saves a response body as a file. The response must be unread — a client that already parsed
 * the body (such as a generated Kubb call) hands you a blob, so use {@link saveBlob} instead.
 */
export const saveBlobResponse = (response: Response, fallbackName: string = "download") => {
  return response
    .blob()
    .then((blob) => saveBlob(blob, response.headers.get("Content-Disposition"), fallbackName));
};

/** Reads the filename out of a `Content-Disposition` header, stripped of unsafe characters. */
export function fileNameFromContentDisposition(disposition?: string | null): string {
  return sanitizeFilename(getFileName(disposition ?? ""));
}

export function downloadFile(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Credits to https://stackoverflow.com/a/67994693
function getFileName(disposition: string): string {
  const utf8FilenameRegex = /filename\*=UTF-8''([\w%!#$&+.^`|~\\-]+)(?:; ?|$)/i;
  const asciiFilenameRegex = /^filename=(["']?)(.*?[^\\])\1(?:; ?|$)/i;

  let fileName = "";

  const utf8Match = utf8FilenameRegex.exec(disposition);
  const utf8FileName = utf8Match ? safeDecodeURIComponent(utf8Match[1]) : null;

  if (utf8FileName) {
    fileName = utf8FileName;
  } else {
    // prevent ReDos attacks by anchoring the ascii regex to string start and
    //  slicing off everything before 'filename='
    const filenameStart = disposition.toLowerCase().indexOf("filename=");
    if (filenameStart >= 0) {
      const partialDisposition = disposition.slice(filenameStart);
      const matches = asciiFilenameRegex.exec(partialDisposition);
      if (matches?.[2]) {
        fileName = matches[2];
      }
    }
  }

  return fileName;
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

/** Strip path traversal and other unsafe characters from a filename. */
function sanitizeFilename(name: string): string {
  return name
    .replaceAll("\0", "")
    .replace(/[\\/:]/g, "")
    .replace(/\.\./g, "");
}
