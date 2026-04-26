import { Search, X } from "lucide-react";
import { format } from "date-fns";

interface HeaderProps {
  query: string;
  onQueryChange: (q: string) => void;
  now: Date;
}

export function Header({ query, onQueryChange, now }: HeaderProps) {
  const monthYear = format(now, "MMMM yyyy");

  return (
    <header className="px-5 pt-8 sm:pt-12 pb-5">
      <div className="text-[0.6875rem] uppercase tracking-[0.18em] text-ink-muted font-medium mb-3">
        Anchorage · Mat-Su · Kenai
      </div>
      <h1 className="font-display font-semibold text-ink leading-[0.95] tracking-[-0.02em] text-[2.5rem] sm:text-[3.25rem]">
        Around
        <br />
        <span className="font-display-italic font-normal text-spruce">
          Anchorage
        </span>
      </h1>
      <div className="rule mt-5 mb-4" />
      <p className="font-display-italic text-[1rem] text-ink-soft leading-snug">
        Discover what&rsquo;s on
      </p>
      <p className="font-display-italic text-[0.875rem] text-ink-muted leading-snug mt-0.5">
        {monthYear}
      </p>

      <div className="relative mt-6">
        <Search
          aria-hidden
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
          size={16}
          strokeWidth={2}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search events, places…"
          className="w-full bg-surface border border-line rounded-full pl-10 pr-10 py-2.5 text-[0.9375rem] placeholder:text-ink-muted focus:border-spruce/60 transition-colors"
          enterKeyHint="search"
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-line/60 text-ink-muted"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </header>
  );
}
