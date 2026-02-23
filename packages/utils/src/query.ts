import { isPlainObject } from "./object";

export function buildQueryString(object: unknown) {
  if (!isPlainObject(object)) return "";

  const args: string[] = [];

  for (const key in object) destructure(key, object[key]);

  function destructure(key: string, value: any) {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        destructure(key + "[" + i + "]", value[i]);
      }
    } else if (Object.prototype.toString.call(value) === "[object Object]") {
      for (const i in value) {
        destructure(key + "[" + i + "]", value[i]);
      }
    } else {
      if (value != null && value !== "") {
        args.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
      }
    }
  }

  return args.join("&");
}

export const saveBlobResponse = (response: Response, fallbackName: string = "download") => {
  response.blob().then((blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      sanitizeFilename(getFileName(response.headers.get("Content-Disposition") ?? "")) ||
      fallbackName;
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  });
};

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
  const utf8FilenameRegex = /filename\*=UTF-8''([\w%\-\\.]+)(?:; ?|$)/i;
  const asciiFilenameRegex = /^filename=(["']?)(.*?[^\\])\1(?:; ?|$)/i;

  let fileName = "";

  if (utf8FilenameRegex.test(disposition)) {
    fileName = decodeURIComponent(utf8FilenameRegex.exec(disposition)![1]);
  } else {
    // prevent ReDos attacks by anchoring the ascii regex to string start and
    //  slicing off everything before 'filename='
    const filenameStart = disposition.toLowerCase().indexOf("filename=");
    if (filenameStart >= 0) {
      const partialDisposition = disposition.slice(filenameStart);
      const matches = asciiFilenameRegex.exec(partialDisposition);
      if (matches != null && matches[2]) {
        fileName = matches[2];
      }
    }
  }

  return fileName;
}

/** Strip path traversal and other unsafe characters from a filename. */
function sanitizeFilename(name: string): string {
  // Remove path separators and null bytes
  return name.replace(/[\\/:\x00]/g, "").replace(/\.\./g, "");
}
