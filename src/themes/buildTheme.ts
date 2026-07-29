import type { MarkdownLiveStyles, MarkdownPalette } from "../types";

/**
 * 
 * # Build Markdown Styles
 *
 * When we insatantiate the markdown live editor the markdown elements should have a base style
 * that's why this function main need its to instance a theme (based on the palette) and define
 * the **components style** and the **color palettes** from the element. 
 * 
 * @param palette 
 * 
 * @returns Result Markdown style for the elements shown in the editor. 
 */
export function buildMarkdownStyles(palette: MarkdownPalette): MarkdownLiveStyles {
  const { text, textImportant, textMuted, textFaint, accent, surfaceTint, border, caret, selection } = palette;

  return {
    content: `outline-none text-sm leading-relaxed py-6 [&>*]:rounded-md [&>*]:transition-[box-shadow,background-color,padding] [&>*]:duration-200 ${text} ${caret} ${selection}`,
    p: "mb-4 last:mb-0 text-sm leading-relaxed pl-[var(--select-pad,0px)]",
    strong: `text-sm font-semibold ${textImportant}`,
    em: `italic ${textMuted}`,
    h1: `text-2xl font-bold leading-tight mb-2 pl-[var(--select-pad,0px)] ${textImportant}`,
    h2: `text-lg leading-tight font-bold mb-1 mt-6 pl-[var(--select-pad,0px)] ${text}`,
    h3: `font-bold mt-6 pl-[var(--select-pad,0px)] ${text}`,
    hr: `border-0 h-px mb-3 mt-2 ${surfaceTint}`,
    code: `rounded text-xs font-light px-1 py-0.5 font-mono ${surfaceTint} ${textMuted}`,
    blockquote: `border-l-2 pl-[calc(0.75rem+var(--select-pad,0px))] italic text-sm mb-4 last:mb-0 ${border} ${textFaint}`,
    ul: "list-disc pl-[calc(1.5rem+var(--select-pad,0px))] flex flex-col last:pb-0 mb-4 text-sm",
    ol: "list-decimal pl-[calc(3rem+var(--select-pad,0px))] flex flex-col mb-2 last:mb-0",
    li: `leading-snug last:mb-0 text-sm [&>p]:[--select-pad:0px] ${accent}`,
    table: "w-full border-collapse text-sm pl-[var(--select-pad,0px)]",
    tr: `border-b last:border-0 ${border}`,
    th: `text-left px-2 py-1.5 font-semibold ${text}`,
    td: `px-2 py-1.5 align-top ${text}`,
  };
}
