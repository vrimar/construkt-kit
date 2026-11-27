import { type FSWatcher, existsSync, statSync, watch } from "node:fs";
import path from "node:path";

const nearestExisting = (target: string) => {
  let dir = target;
  while (!existsSync(dir) && path.dirname(dir) !== dir) dir = path.dirname(dir);
  return dir;
};

const isMissing = (error: unknown) => (error as NodeJS.ErrnoException).code === "ENOENT";

// Windows reports a deleted watched directory as EPERM.
const isGone = (error: unknown) =>
  isMissing(error) || (error as NodeJS.ErrnoException).code === "EPERM";

export const watchPath = (
  target: string,
  onChange: () => void,
  onError: (error: Error) => void,
) => {
  let watcher: FSWatcher | undefined;
  let watched = "";

  const open = (dir: string): FSWatcher => {
    if (dir !== target) return watch(dir, onEvent);
    if (statSync(target).isDirectory()) return watch(target, { recursive: true }, onEvent);

    // A file watch follows its inode, which an editor's save-by-rename replaces.
    const name = path.basename(target);
    return watch(path.dirname(target), (_event, file) => {
      if (file === null || file === name || !existsSync(target)) onEvent();
    });
  };

  const attach = (force = false) => {
    let next = nearestExisting(target);
    if (!force && watcher && next === watched) return;
    watcher?.close();
    watcher = undefined;

    for (;;) {
      try {
        watched = next;
        watcher = open(next);
        break;
      } catch (error) {
        if (!isMissing(error) || path.dirname(next) === next) {
          watched = "";
          onError(error as Error);
          return;
        }
        next = nearestExisting(path.dirname(next));
      }
    }
    watcher.on("error", (error) => {
      if (isGone(error)) return attach(true);
      watcher?.close();
      watcher = undefined;
      watched = "";
      onError(error);
    });
  };

  const onEvent = () => {
    const was = watched;
    attach();
    if (was === target || watched === target) onChange();
  };

  attach();
  return () => watcher?.close();
};
