import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import type { MarkdownLiveTheme } from "markdown-live-editor";

export function DarkModeToggle({ theme }: { theme: MarkdownLiveTheme }) {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <button
      type="button"
      title="Toggle dark mode"
      onClick={() => setIsDark((v) => !v)}
      className={`flex items-center justify-center h-6 w-6 rounded border text-xs transition hover:opacity-80 cursor-pointer ${theme.menu.background} ${theme.menu.border} ${theme.menu.text}`}
    >
      {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
    </button>
  );
}
