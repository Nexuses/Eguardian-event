"use client";

import { useCallback, useEffect, useRef } from "react";

type RichDescriptionEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeightClass?: string;
};

export function RichDescriptionEditor({
  value,
  onChange,
  placeholder = "Describe the event for attendees",
  minHeightClass = "min-h-[140px]",
}: RichDescriptionEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef(value);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value && value !== lastEmitted.current) {
      el.innerHTML = value || "";
    }
    lastEmitted.current = value;
  }, [value]);

  const syncFromEditor = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? "";
    lastEmitted.current = html;
    onChange(html);
  }, [onChange]);

  function applyBold() {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand("bold", false);
    syncFromEditor();
  }

  const inputClass =
    "w-full rounded-b-md border border-t-0 border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100";

  return (
    <div className="rounded-md border border-zinc-300 dark:border-zinc-600">
      <div className="flex items-center gap-1 rounded-t-md border-b border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800/80">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyBold();
          }}
          className="rounded px-2.5 py-1 text-sm font-bold text-zinc-800 hover:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-zinc-700"
          title="Bold"
          aria-label="Bold"
        >
          B
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
        onInput={syncFromEditor}
        onBlur={syncFromEditor}
        data-placeholder={placeholder}
        className={`${inputClass} ${minHeightClass} rounded-t-none empty:before:pointer-events-none empty:before:text-zinc-500 empty:before:content-[attr(data-placeholder)] dark:empty:before:text-zinc-400 [&_b]:font-bold [&_strong]:font-bold`}
      />
    </div>
  );
}
