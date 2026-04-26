import { useMemo, useState } from "react";
import { loadEvents } from "./data/events";
import { applyFilters, browseEvents } from "./lib/filters";
import { useUrlFilters } from "./lib/url-state";
import type { AppEvent, Category, FitnessSub } from "./types";
import { Header } from "./components/Header";
import { FilterBar } from "./components/FilterBar";
import { FocusSection } from "./components/FocusSection";
import { BrowseSection } from "./components/BrowseSection";
import { EventDialog } from "./components/EventDialog";

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export default function App() {
  // `now` is captured once per mount so date math is stable while user interacts
  const [now] = useState(() => new Date());
  const allEvents = useMemo(() => loadEvents(now), [now]);

  const [filters, setFilters] = useUrlFilters();
  const [selected, setSelected] = useState<AppEvent | null>(null);

  const focusEvents = useMemo(
    () => applyFilters(allEvents, filters, now),
    [allEvents, filters, now]
  );

  const browseAllEvents = useMemo(
    () => browseEvents(allEvents, filters, now),
    [allEvents, filters, now]
  );

  return (
    <div className="mx-auto max-w-2xl">
      <Header
        query={filters.query}
        onQueryChange={(q) => setFilters({ query: q })}
        now={now}
      />
      <FilterBar
        range={filters.range}
        categories={filters.categories}
        subs={filters.subs}
        family={filters.family}
        onRangeChange={(r) => setFilters({ range: r })}
        onToggleCategory={(c: Category) =>
          setFilters({ categories: toggleInList(filters.categories, c) })
        }
        onClearCategories={() => setFilters({ categories: [], subs: [] })}
        onToggleSub={(s: FitnessSub) =>
          setFilters({ subs: toggleInList(filters.subs, s) })
        }
        onClearSubs={() => setFilters({ subs: [] })}
        onFamilyChange={(v) => setFilters({ family: v })}
      />
      <FocusSection
        events={focusEvents}
        range={filters.range}
        categories={filters.categories}
        subs={filters.subs}
        family={filters.family}
        onSelectEvent={setSelected}
      />
      <BrowseSection events={browseAllEvents} onSelectEvent={setSelected} />

      <footer className="px-5 py-10 text-center">
        <div className="rule mb-5" />
        <div className="text-[0.75rem] text-ink-muted font-display-italic">
          Updated weekly · {allEvents.length} events tracked
        </div>
      </footer>

      <EventDialog event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
