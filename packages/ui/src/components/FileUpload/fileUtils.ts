/** Why a file was refused; `validate` may return codes of its own. */
export type FileError =
  | "TOO_MANY_FILES"
  | "FILE_INVALID_TYPE"
  | "FILE_TOO_LARGE"
  | "FILE_TOO_SMALL"
  | "FILE_INVALID"
  | "FILE_EXISTS"
  | (string & {});

/** A file the upload refused, with every reason it was refused for. */
export interface FileRejection {
  file: File;
  errors: FileError[];
}

/** What a file picker or drop accepts: MIME types, extensions, or MIME types with their extensions. */
export type FileAccept = string | string[] | Record<string, string[]>;

const MIME_TYPES =
  "3g2_video/3gpp2[3gp,3gpp_video/3gpp[3mf_model/3mf[7z_application/x-7z-compressed[aac_audio/aac[ac_application/pkix-attr-cert[adp_audio/adpcm[adts_audio/aac[ai_application/postscript[aml_application/automationml-aml+xml[amlx_application/automationml-amlx+zip[amr_audio/amr[apk_application/vnd.android.package-archive[apng_image/apng[appcache,manifest_text/cache-manifest[appinstaller_application/appinstaller[appx_application/appx[appxbundle_application/appxbundle[asc_application/pgp-keys[atom_application/atom+xml[atomcat_application/atomcat+xml[atomdeleted_application/atomdeleted+xml[atomsvc_application/atomsvc+xml[au,snd_audio/basic[avi_video/x-msvideo[avci_image/avci[avcs_image/avcs[avif_image/avif[aw_application/applixware[bdoc_application/bdoc[bin,bpk,buffer,deb,deploy,dist,distz,dll,dmg,dms,dump,elc,exe,img,iso,lrf,mar,msi,msm,msp,pkg,so_application/octet-stream[bmp,dib_image/bmp[btf,btif_image/prs.btif[bz2_application/x-bzip2[c_text/x-c[ccxml_application/ccxml+xml[cdfx_application/cdfx+xml[cdmia_application/cdmi-capability[cdmic_application/cdmi-container[cdmid_application/cdmi-domain[cdmio_application/cdmi-object[cdmiq_application/cdmi-queue[cer_application/pkix-cert[cgm_image/cgm[cjs_application/node[class_application/java-vm[coffee,litcoffee_text/coffeescript[conf,def,in,ini,list,log,text,txt_text/plain[cpp,cxx,cc_text/x-c++src[cpl_application/cpl+xml[cpt_application/mac-compactpro[crl_application/pkix-crl[css_text/css[csv_text/csv[cu_application/cu-seeme[cwl_application/cwl[cww_application/prs.cww[davmount_application/davmount+xml[dbk_application/docbook+xml[doc_application/msword[docx_application/vnd.openxmlformats-officedocument.wordprocessingml.document[dsc_text/prs.lines.tag[dssc_application/dssc+der[dtd_application/xml-dtd[dwd_application/atsc-dwd+xml[ear,jar,war_application/java-archive[ecma_application/ecmascript[emf_image/emf[eml,mime_message/rfc822[emma_application/emma+xml[emotionml_application/emotionml+xml[eot_application/vnd.ms-fontobject[eps,ps_application/postscript[epub_application/epub+zip[exi_application/exi[exp_application/express[exr_image/aces[ez_application/andrew-inset[fdf_application/fdf[fdt_application/fdt+xml[fits_image/fits[flac_audio/flac[flv_video/x-flv[g3_image/g3fax[geojson_application/geo+json[gif_image/gif[glb_model/gltf-binary[gltf_model/gltf+json[gml_application/gml+xml[go_text/x-go[gpx_application/gpx+xml[gz_application/gzip[h_text/x-h[h261_video/h261[h263_video/h263[h264_video/h264[heic_image/heic[heics_image/heic-sequence[heif_image/heif[heifs_image/heif-sequence[htm,html,shtml_text/html[ico_image/x-icon[icns_image/x-icns[ics,ifb_text/calendar[iges,igs_model/iges[ink,inkml_application/inkml+xml[ipa_application/octet-stream[java_text/x-java-source[jp2,jpg2_image/jp2[jpeg,jpe,jpg_image/jpeg[jpf,jpx_image/jpx[jpm,jpgm_image/jpm[jpgv_video/jpeg[jph_image/jph[js,mjs_text/javascript[json_application/json[json5_application/json5[jsonld_application/ld+json[jsx_text/jsx[jxl_image/jxl[jxr_image/jxr[ktx_image/ktx[ktx2_image/ktx2[less_text/less[m1v,m2v,mpe,mpeg,mpg_video/mpeg[m4a_audio/mp4[m4v_video/x-m4v[md,markdown_text/markdown[mid,midi,kar,rmi_audio/midi[mkv_video/x-matroska[mp2,mp2a,mp3,mpga,m3a,m2a_audio/mpeg[mp4,mp4v,mpg4_video/mp4[mp4a_audio/mp4[mp4s,m4p_application/mp4[odp_application/vnd.oasis.opendocument.presentation[oda_application/oda[ods_application/vnd.oasis.opendocument.spreadsheet[odt_application/vnd.oasis.opendocument.text[oga,ogg,opus,spx_audio/ogg[ogv_video/ogg[ogx_application/ogg[otf_font/otf[p12,pfx_application/x-pkcs12[pdf_application/pdf[pem_application/x-pem-file[php_text/x-php[png_image/png[ppt_application/vnd.ms-powerpoint[pptx_application/vnd.openxmlformats-officedocument.presentationml.presentation[pskcxml_application/pskc+xml[psd_image/vnd.adobe.photoshop[py_text/x-python[qt,mov_video/quicktime[rar_application/vnd.rar[rdf_application/rdf+xml[rtf_text/rtf[sass_text/x-sass[scss_text/x-scss[sgm,sgml_text/sgml[sh_application/x-sh[svg,svgz_image/svg+xml[swf_application/x-shockwave-flash[tar_application/x-tar[tif,tiff_image/tiff[toml_application/toml[ts_video/mp2t[tsx_text/tsx[tsv_text/tab-separated-values[ttc_font/collection[ttf_font/ttf[vtt_text/vtt[wasm_application/wasm[wav_audio/wav[weba_audio/webm[webm_video/webm[webmanifest_application/manifest+json[webp_image/webp[wma_audio/x-ms-wma[wmv_video/x-ms-wmv[woff_font/woff[woff2_font/woff2[xls_application/vnd.ms-excel[xlsx_application/vnd.openxmlformats-officedocument.spreadsheetml.sheet[xml_application/xml[xz_application/x-xz[yaml,yml_text/yaml[zip_application/zip";

const mimeTypesByExtension = new Map<string, string>(
  MIME_TYPES.split("[").flatMap((entry) => {
    const [extensions = "", mimeType = ""] = entry.split("_");
    return extensions.split(",").map((extension): [string, string] => [extension, mimeType]);
  }),
);

function getFileMimeType(name: string): string | null {
  const extension = name.split(".").pop()?.toLowerCase();
  return extension ? (mimeTypesByExtension.get(extension) ?? null) : null;
}

const isMimeType = (value: string) =>
  value === "*/*" ||
  value === "audio/*" ||
  value === "video/*" ||
  value === "image/*" ||
  value === "text/*" ||
  /\w+\/[-+.\w]+/g.test(value);

const isExtension = (value: string) => /^.*\.[\w]+$/.test(value);

const isValidAccept = (value: string) => isMimeType(value) || isExtension(value);

/** `accept` as the comma-separated list a file input's `accept` attribute takes. */
export function getAcceptAttribute(accept: FileAccept | undefined): string | undefined {
  if (accept == null) return undefined;
  if (typeof accept === "string") return accept;
  if (Array.isArray(accept)) return accept.filter(isValidAccept).join(",");
  return Object.entries(accept)
    .flatMap(([mimeType, extensions]) => [mimeType, ...extensions])
    .filter(isValidAccept)
    .join(",");
}

interface AcceptMatchers {
  extensions: string[];
  baseMimes: string[];
  mimes: string[];
}

function parseAccept(accept: string | undefined): AcceptMatchers | null {
  if (!accept) return null;
  const matchers: AcceptMatchers = { extensions: [], baseMimes: [], mimes: [] };
  for (const type of accept.split(",")) {
    const valid = type.trim().toLowerCase();
    if (valid === "*" || valid === "*/*") return null;
    if (valid.charAt(0) === ".") matchers.extensions.push(valid);
    else if (valid.endsWith("/*")) matchers.baseMimes.push(valid.slice(0, valid.indexOf("/")));
    else matchers.mimes.push(valid);
  }
  if (!matchers.extensions.length && !matchers.baseMimes.length && !matchers.mimes.length) {
    return null;
  }
  return matchers;
}

function matchesAccept(matchers: AcceptMatchers, file: File) {
  const fileName = file.name || "";
  const mimeType = (file.type || getFileMimeType(fileName) || "").toLowerCase();
  if (matchers.mimes.includes(mimeType)) return true;
  if (matchers.baseMimes.length) {
    const slash = mimeType.indexOf("/");
    if (matchers.baseMimes.includes(slash === -1 ? mimeType : mimeType.slice(0, slash))) {
      return true;
    }
  }
  const lowerName = fileName.toLowerCase();
  return matchers.extensions.some((extension) => lowerName.endsWith(extension));
}

/** Checks files against an `accept` attribute, parsing it once. */
export function createFileTypeValidator(accept: string | undefined) {
  const matchers = parseAccept(accept);
  return (file: File): FileError | null =>
    file.type === "application/x-moz-file" || !matchers || matchesAccept(matchers, file)
      ? null
      : "FILE_INVALID_TYPE";
}

export function getFileSizeError(file: File, minSize: number, maxSize: number): FileError | null {
  if (file.size > maxSize) return "FILE_TOO_LARGE";
  if (file.size < minSize) return "FILE_TOO_SMALL";
  return null;
}

export const isFileEqual = (a: File, b: File): boolean =>
  a.name === b.name && a.size === b.size && a.type === b.type;

export const getFileKey = (file: File): string => `${file.name}|${file.size}|${file.type}`;

const getItemEntry = (item: DataTransferItem): FileSystemEntry | null => {
  const withEntry = item as DataTransferItem & { getAsEntry?: () => FileSystemEntry | null };
  if (typeof withEntry.getAsEntry === "function") return withEntry.getAsEntry();
  return typeof item.webkitGetAsEntry === "function" ? item.webkitGetAsEntry() : null;
};

const isDirectoryEntry = (entry: FileSystemEntry): entry is FileSystemDirectoryEntry =>
  entry.isDirectory;

const isFileEntry = (entry: FileSystemEntry): entry is FileSystemFileEntry => entry.isFile;

const withRelativePath = (file: File, path: string) => {
  Object.defineProperty(file, "relativePath", { value: path ? `${path}/${file.name}` : file.name });
  return file;
};

const readEntryFile = (entry: FileSystemFileEntry, path: string) =>
  new Promise<File>((resolve) => entry.file((file) => resolve(withRelativePath(file, path))));

function getDirectoryFiles(reader: FileSystemDirectoryReader, path: string): Promise<File[]> {
  return new Promise((resolve) => {
    const batches: Promise<File[]>[] = [];
    const readBatch = () => {
      reader.readEntries((entries) => {
        if (entries.length === 0) {
          void Promise.all(batches).then((files) => resolve(files.flat()));
          return;
        }
        batches.push(
          Promise.all(
            entries.map((entry) => {
              if (isDirectoryEntry(entry)) {
                return getDirectoryFiles(entry.createReader(), `${path}${entry.name}`);
              }
              if (isFileEntry(entry)) return readEntryFile(entry, path).then((file) => [file]);
              return Promise.resolve([]);
            }),
          ).then((files) => files.flat()),
        );
        readBatch();
      });
    };
    readBatch();
  });
}

/** The files a drop carries, walking dropped directories when `directory` is set. */
export async function getFileEntries(
  items: DataTransferItemList,
  directory: boolean | undefined,
): Promise<File[]> {
  const files = await Promise.all(
    Array.from(items)
      .filter((item) => item.kind === "file")
      .map((item): Promise<File[]> => {
        const entry = getItemEntry(item);
        if (!entry) return Promise.resolve([]);
        if (isDirectoryEntry(entry) && directory) {
          return getDirectoryFiles(entry.createReader(), entry.name);
        }
        if (isFileEntry(entry)) {
          const file = item.getAsFile();
          return file
            ? Promise.resolve([withRelativePath(file, "")])
            : readEntryFile(entry, "").then((read) => [read]);
        }
        return Promise.resolve([]);
      }),
  );
  return files.flat();
}

/** Whether a drag carries files, rather than text or links. */
export function isEventWithFiles(event: {
  dataTransfer: DataTransfer | null;
  target: EventTarget | null;
}) {
  if (!event.dataTransfer) return event.target != null && "files" in event.target;
  return event.dataTransfer.types.some(
    (type) => type === "Files" || type === "application/x-moz-file",
  );
}

export function setInputFiles(input: HTMLInputElement, files: File[]) {
  const view = input.ownerDocument.defaultView;
  if (!view || !("DataTransfer" in view)) return;
  const dataTransfer = new view.DataTransfer();
  for (const file of files) dataTransfer.items.add(file);
  input.files = dataTransfer.files;
}

const BYTE_PREFIXES = ["", "kilo", "mega", "giga", "tera", "peta"];

/** A byte count in decimal units with three significant digits, such as "1.2 MB". */
export function formatBytes(bytes: number, locale: string): string {
  if (Number.isNaN(bytes)) return "";
  if (bytes === 0) return "0 B";
  let value = Math.abs(bytes);
  let index = 0;
  while (value >= 1000 && index < BYTE_PREFIXES.length - 1) {
    value /= 1000;
    index++;
  }
  const rounded = Number.parseFloat(value.toPrecision(3));
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: `${BYTE_PREFIXES[index]}byte`,
    unitDisplay: "short",
  }).format(bytes < 0 ? -rounded : rounded);
}
