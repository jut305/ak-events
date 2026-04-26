# Southcentral Alaska Events Pipeline — Step 1: Research Script

This is the research engine. It calls Claude with web search, gets back
structured JSON of upcoming events, merges with what's already in
`events.json`, and writes the updated file back to disk.

## What it does, in order

1. Loads `events.json` if it exists (otherwise starts empty).
2. Asks Claude to search the web for events in the next 30 days
   matching the categories defined in the prompt.
3. Validates each event (required fields, valid category, parseable date).
4. Prunes events from the existing list whose start time has passed.
5. Merges fresh events with existing ones, deduping by a hash of
   `title + start`. Preserves `firstSeen` timestamps so the UI can flag
   "new this week" later.
6. Sorts by start date and writes back to `events.json`.

## Local test run

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...
python fetch_events.py
```

You should see something like:

```
Fetching events from 2026-04-26 to 2026-05-26...
Loaded 0 existing events
Got 28 events from Claude
Pruned 0 past events
Final count: 28 (28 new)
Wrote events.json
```

Inspect `events.json` and check that the data looks clean. Tune the
prompt in `fetch_events.py` if you want different sources or categories.

## What's next

- **Step 2**: React + FullCalendar site that reads `events.json`.
- **Step 3**: GitHub Actions workflow that runs this script weekly,
  commits `events.json`, and pushes — which triggers Netlify to rebuild.

## Notes

- `MODEL` is set to `claude-sonnet-4-6` — good balance of quality and
  cost for this task. Bump to `claude-opus-4-7` if you want max quality.
- `max_uses: 15` on web_search caps the number of searches per run.
  Bump it if you want more thorough coverage.
- The prompt is the main lever for output quality. If you find the
  model missing certain sources, add them to the SEARCH STRATEGY block.
- Past-event pruning uses a 12-hour grace window so events that just
  ended don't disappear from the calendar mid-day.
