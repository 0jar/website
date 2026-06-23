// Command palette
// Ported from Next.js v4

import { useState, useEffect, useMemo, useRef } from "preact/hooks";
import type { JSX } from "preact";
import { useMounted, useDebounce, isTypingInInput } from "@/hooks";
import { useCommandActions, type Action, PreactIcon } from "./CommandActions";

// Inline KeyboardShortcut component
const KeyboardShortcut = ({ children }: { children: JSX.Element | string | number }) => (
  <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border border-border font-monaspice">
    {children}
  </kbd>
);

export interface CommandBarProps {
  initialOpen?: boolean;
}

export function CommandBar({ initialOpen = false }: CommandBarProps) {
  const [open, setOpen] = useState(initialOpen);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const mounted = useMounted();
  const [pathname, setPathname] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 200);

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  const { allActions, t } = useCommandActions(pathname, setOpen);

  // Filter by query
  const filteredActions = useMemo(() => {
    if (!debouncedQuery) return allActions;
    const q = debouncedQuery.toLowerCase();
    return allActions.filter((a) =>
      `${a.label} ${a.description || ""}`.toLowerCase().includes(q),
    );
  }, [allActions, debouncedQuery]);

  // Group by category
  const groupedActions = useMemo(
    () =>
      filteredActions.reduce(
        (acc, a) => {
          (acc[a.category] ||= []).push(a);
          return acc;
        },
        {} as Record<string, Action[]>,
      ),
    [filteredActions],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el !== inputRef.current && isTypingInInput()) return;

      if (e.key === "." && !open && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredActions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (i) => (i - 1 + filteredActions.length) % filteredActions.length,
        );
      } else if (e.key === "Enter" && filteredActions.length) {
        e.preventDefault();
        filteredActions[selectedIndex]?.action();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, filteredActions, selectedIndex]);

  // Focus input on open & keep selected item in view
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
    else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (open && listboxRef.current && filteredActions.length > 0) {
      const activeEl = document.getElementById(`command-item-${selectedIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, open, filteredActions]);

  if (!mounted) return null;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div
            className="relative bg-background border rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="command-palette-title"
          >
            <h2 id="command-palette-title" className="sr-only">
              {t("actionSearch.title", "Command Palette")}
            </h2>

            <div className="p-4 pb-2">
              <div className="relative flex items-center">
                <PreactIcon name="search" className="absolute left-3 w-4 h-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="command-palette-listbox"
                  aria-autocomplete="list"
                  aria-activedescendant={filteredActions.length > 0 ? `command-item-${selectedIndex}` : undefined}
                  placeholder={t("actionSearch.placeholder", "Search actions...")}
                  value={query}
                  onChange={(e) => {
                    setQuery((e.target as HTMLInputElement).value);
                    setSelectedIndex(0);
                  }}
                  className="w-full pl-10 pr-4 h-10 bg-background border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div ref={listboxRef} id="command-palette-listbox" role="listbox" className="max-h-[60vh] overflow-y-auto" aria-label={t("actionSearch.results", "Action results")}>
              {filteredActions.length > 0 ? (
                <div className="pb-2 animate-in fade-in duration-200">
                  {Object.entries(groupedActions).map(([category, actions]) => (
                    <div key={category} className="px-2" role="group" aria-label={category}>
                      <div className="text-xs font-medium text-muted-foreground px-2 py-1.5" aria-hidden="true">
                        {category}
                      </div>
                      {actions.map((a) => {
                        const idx = filteredActions.findIndex((x) => x.id === a.id);
                        return (
                          <div
                            key={a.id}
                            id={`command-item-${idx}`}
                            role="option"
                            aria-selected={idx === selectedIndex}
                            className={`px-2 py-1.5 flex items-center justify-between rounded-md cursor-pointer transition-colors ${idx === selectedIndex ? "bg-muted" : "hover:bg-muted/50"}`}
                            onClick={() => a.action()}
                            onMouseEnter={() => setSelectedIndex(idx)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="flex-shrink-0" aria-hidden="true">{a.icon}</span>
                              <span className="text-sm font-medium">{a.label}</span>
                              {a.description && <span className="text-xs text-muted-foreground">{a.description}</span>}
                            </div>
                            {a.shortcut && <KeyboardShortcut>{a.shortcut}</KeyboardShortcut>}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center animate-in fade-in duration-200" role="status">
                  <p className="text-muted-foreground">{t("actionSearch.noResults", "No actions found")}</p>
                </div>
              )}
            </div>

            <div className="p-2 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
                <span>{t("actionSearch.pressToOpen", "Press . to open command palette")}</span>
                <span>{t("actionSearch.escToClose", "ESC to close")}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
