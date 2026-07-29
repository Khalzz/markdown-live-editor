import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { MarkdownLiveMenuStyles } from "markdown-live-editor";

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  // Optional per-option color dot — ThemeSelect uses this for each theme's
  // `swatch`, but Dropdown itself has no idea what a "theme" is.
  swatch?: string;
}

// A whole self-contained dropdown — trigger button, open/close state
// (outside click, Escape), and the options panel all in one — with no
// theme-specific knowledge at all. ThemeSelect is the one that knows about
// themes; it just hands this the values it defined.
export function Dropdown<T extends string>({ options, value, menu, onChange }: {
  options: DropdownOption<T>[];
  value: T;
  menu: MarkdownLiveMenuStyles;
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 text-xs rounded px-2 py-1 border transition hover:opacity-80 ${menu.background} ${menu.border} ${menu.text}`}
      >
        {selected?.swatch && (
          <span
            className="h-3 w-3 rounded-full border border-white/10 shrink-0"
            style={{ backgroundColor: selected.swatch }}
          />
        )}
        <span className="capitalize">{selected?.label ?? value}</span>
        <ChevronDown className={`h-3 w-3 opacity-60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className={`absolute right-0 top-full mt-1 z-10 min-w-full border rounded-md shadow-lg py-1 ${menu.background} ${menu.border}`}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { onChange(option.value); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left whitespace-nowrap transition rounded ${option.value === value ? menu.buttonActive : menu.button}`}
            >
              {option.swatch && (
                <span
                  className="h-3 w-3 rounded-full border border-white/10 shrink-0"
                  style={{ backgroundColor: option.swatch }}
                />
              )}
              <span className="capitalize">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
