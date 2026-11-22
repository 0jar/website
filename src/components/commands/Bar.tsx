import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { getActions, Icon, type Action } from "./Actions";
import { t } from "@/i18n/client";

export function mountPalette(root: HTMLElement, dialog: HTMLDialogElement) {
  render(<Bar actions={getActions()} close={() => dialog.close()} />, root);
  dialog.addEventListener("close", () => render(null, root), { once: true });
}

function Bar({ actions, close }: { actions: Action[]; close: () => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const matches = actions.filter(action => action.label.toLowerCase().includes(query.toLowerCase()));
  const activeId = matches[selected] && `command-item-${selected}`;
  const run = (action: Action) => { close(); action.run(); };

  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId, query]);

  return (
    <>
      <div class="relative flex items-center gap-2 p-4 pb-2">
        <Icon name="search" className="absolute left-7 w-4 h-4 text-muted-foreground" />
        <input autoFocus type="text" role="combobox" aria-expanded="true" aria-autocomplete="list"
          aria-controls="command-results" aria-activedescendant={activeId}
          aria-label={t("actionSearch.title")} placeholder={t("actionSearch.placeholder")}
          class="w-full rounded-md border bg-background py-2 pl-10 pr-3 text-sm"
          value={query} onInput={event => { setQuery(event.currentTarget.value); setSelected(0); }}
          onKeyDown={event => {
            if (event.isComposing || !matches.length) return;
            if (event.key === "Enter") run(matches[selected]);
            else if (event.key === "ArrowDown") setSelected((selected + 1) % matches.length);
            else if (event.key === "ArrowUp") setSelected((selected + matches.length - 1) % matches.length);
            else return;
            event.preventDefault();
          }}
        />
        <button type="button" onClick={close} aria-label={t("keyboardShortcuts.close")} class="rounded p-2 hover:bg-muted">
          <Icon name="x" />
        </button>
      </div>
      <div id="command-results" role="listbox" aria-label={t("actionSearch.title")} class="max-h-[52vh] overflow-y-auto px-2 pb-2">
        {matches.map((action, i) => (
          <div key={action.id}>
            {action.category !== matches[i - 1]?.category && <div aria-hidden="true" class="px-2 py-1 text-xs text-muted-foreground">{action.category}</div>}
            <div role="option" id={`command-item-${i}`} aria-selected={i === selected}
              class={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm ${i === selected ? "bg-muted" : "hover:bg-muted/50"}`}
              onClick={() => run(action)} onMouseEnter={() => setSelected(i)}>
              <Icon name={action.icon} />
              <span class="flex-1">{action.label}</span>
              {action.shortcut && <kbd class="rounded border bg-muted px-1.5 py-0.5 text-xs">{action.shortcut}</kbd>}
            </div>
          </div>
        ))}
      </div>
      {!matches.length && <p role="status" class="p-4 text-center text-muted-foreground">{t("actionSearch.noResults")}</p>}
      <div class="flex justify-between gap-2 border-t p-2 text-xs text-muted-foreground">
        <span>{t("actionSearch.pressToOpen")}</span><span>{t("actionSearch.escToClose")}</span>
      </div>
    </>
  );
}
