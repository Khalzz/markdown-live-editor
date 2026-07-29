import { MARKDOWN_LIVE_THEMES, type MarkdownLiveThemeName } from "markdown-live-editor";
import { Dropdown } from "./Dropdown";

const THEME_NAMES = Object.keys(MARKDOWN_LIVE_THEMES) as MarkdownLiveThemeName[];
const THEME_OPTIONS = THEME_NAMES.map((name) => ({
  value: name,
  label: name,
  swatch: MARKDOWN_LIVE_THEMES[name].swatch,
}));

export function ThemeSelect({ value, onChange }: {
  value: MarkdownLiveThemeName;
  onChange: (name: MarkdownLiveThemeName) => void;
}) {
  const { menu } = MARKDOWN_LIVE_THEMES[value];
  return <Dropdown options={THEME_OPTIONS} value={value} menu={menu} onChange={onChange} />;
}
