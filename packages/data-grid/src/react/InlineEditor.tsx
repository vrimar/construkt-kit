import { isComposingEvent } from "@construkt-kit/ui";
import { type KeyboardEvent, useLayoutEffect, useRef } from "react";

import { useEditorTab } from "./context";
import type { AnyGridCore } from "./useGridCore";

interface InlineEditorProps {
  core: AnyGridCore;
  className: string;
  label: string;
}

export function InlineEditor({ core, className, label }: InlineEditorProps) {
  const ref = useRef<HTMLInputElement>(null);
  const onTab = useEditorTab();
  const text = core.editing.state?.text ?? "";

  useLayoutEffect(() => {
    const input = ref.current;
    input?.focus({ preventScroll: true });
    input?.select();
  }, []);

  const finish = (commit: boolean) => {
    if (commit) core.editing.commit(ref.current?.value ?? text);
    else core.editing.cancel();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (isComposingEvent(event)) return;
    if (event.key === "Enter") {
      event.preventDefault();
      finish(true);
    } else if (event.key === "Escape") {
      event.preventDefault();
      finish(false);
    } else if (event.key === "Tab") {
      finish(true);
      onTab(event);
    }
  };

  return (
    <input
      ref={ref}
      className={className}
      defaultValue={text}
      aria-label={label}
      spellCheck={false}
      autoComplete="off"
      onKeyDown={onKeyDown}
      onBlur={() => finish(true)}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
    />
  );
}
