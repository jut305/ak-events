"""
fetch_events.py — Southcentral Alaska events research pipeline.

Calls Claude with web search to find upcoming events, merges results with
existing events.json, dedupes, prunes past events, and writes back to disk.

Designed to run on a schedule (GitHub Actions cron) and commit the updated
events.json so Netlify rebuilds the site.
"""

import json
import hashlib
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import anthropic

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------

EVENTS_FILE = Path(__file__).parent / "events.json"
LOOKAHEAD_DAYS = 30
MODEL = "claude-sonnet-4-6"  # update if a newer model is preferred
MAX_TOKENS = 8000

# Alaska time (AKDT in summer, AKST in winter). For prompt clarity we just
# say "Alaska time" and let the model emit the correct offset.
AK_TZ_LABEL = "Alaska time"


PROMPT_TEMPLATE = """\
You are researching upcoming events in Southcentral Alaska for an
events calendar website. Search the web thoroughly across multiple
sources to find events happening between {start_date} and {end_date}.

GEOGRAPHIC FOCUS: Anchorage, Eagle River, Palmer, Wasilla, Girdwood,
and the Kenai Peninsula (Seward, Soldotna, Homer, Kenai, Cooper Landing).

CATEGORIES OF INTEREST:
- Outdoor fitness: running races, 5Ks/10Ks/half/full marathons, trail
  runs, mountain biking races, packrafting events, ski races, fat bike
  events, triathlons
- Live outdoor music: concerts, festivals, outdoor venues
- Food events: festivals, farmers markets with special events, tastings,
  pop-ups, restaurant weeks
- Photography (specifically): photo workshops, photography gallery
  openings, photo walks, aurora photography events
- Arts and culture: theater, dance, gallery openings (non-photo),
  museum exhibitions, visual art shows, literary readings, film
  screenings, comedy
- Hiking: organized hikes, trail events, guided outings
- Major significant events: anything notable that draws crowds —
  cultural festivals, fairs, civic events, fundraisers of scale

SEARCH STRATEGY — search by category, not just by aggregator. Use:

General/major: Visit Anchorage, Anchorage Daily News calendar,
Alaska.org, anchorage.events, Eventbrite Alaska. Newspapers: Peninsula
Clarion, Frontiersman, Homer News.

Music: Bear Tooth Theatrepub event calendar, 49th State Brewing,
Williwaw, Moose's Tooth, Atwood Concert Hall, Alaska Center for the
Performing Arts, Songkick Anchorage.

Fitness: Skinny Raven Sports event calendar, Anchorage Running Club,
MTA (Mat-Su Trails Association), Seward Parks & Recreation, RunSignUp
Alaska, TriSignup Alaska, Alaska Bicycle Club.

Food: Spenard Farmers Market, Anchorage Market & Festival, Bear Tooth
event calendar (food-themed nights), Alaska Restaurant Week, local
restaurant pop-ups and tasting events.

Hiking: Mountaineering Club of Alaska (mtnclubak.org), Alaska Trails
(alaska-trails.org), Eagle River Nature Center (ernc.org), Chugach
State Park events, Kenai Mountains-Turnagain Arm National Heritage Area.

Photography: Anchorage Museum, Alaska Geographic, local camera clubs,
gallery openings, aurora photography workshops.

Eagle River specifically: Eagle River Nature Center events, Eagle River
Lions Club, Chugiak-Eagle River Chamber of Commerce, Birchwood events.

Kenai Peninsula: Kenai/Soldotna/Homer/Seward/Cooper Landing chamber
sites, Kenai Peninsula Borough events, Kachemak Bay Conservation Society.

OUTPUT FORMAT: Return ONLY a valid JSON array, no prose before or after,
no markdown code fences. Each event must match this schema exactly:

{{
  "title": "string — event name, no marketing fluff",
  "start": "ISO 8601 datetime in {ak_tz}, e.g. 2026-05-15T09:00:00-08:00",
  "end": "ISO 8601 datetime or null if unknown",
  "allDay": boolean,
  "location": "string — venue name, city",
  "category": "one of: fitness | music | food | photography | arts | hiking | major",
  "description": "string — 1-2 sentences, factual, no marketing language",
  "sourceUrl": "string — direct link to event page, not the homepage",
  "sourceName": "string — name of the source, e.g. 'Visit Anchorage'",
  "familyFriendly": "boolean — true if explicitly welcoming to children/families (kids' events, all-ages festivals, family hikes, community markets); false for 21+/adults-only events; default false if uncertain"
}}

QUALITY RULES:
- Only include events you can verify with a source URL
- STRONGLY prefer the organizer's own page over aggregators. Example:
  use anchoragerunningclub.org/twghm, NOT allevents.in or
  anchorage.events. If only an aggregator carries the listing, accept
  it, but search for the primary source first.
- Always include a specific venue name in `location`, not just the
  city. "Anchorage" alone is not acceptable — find the actual venue.
- Skip events with vague dates ("this summer", "TBD")
- Skip events that span more than 7 days. Month-long banner events
  (citywide cleanups, awareness months) clutter the calendar.
- Deduplicate aggressively: events with the same venue and the same
  start time are the same event, even if the title differs slightly.
  Pick one entry.
- Skip recurring weekly things (regular farmers markets, weekly runs)
  unless there is a special edition
- If a real multi-day event spans 2-7 days, create one entry with
  start/end covering the full range
- Use null for unknown fields, never guess
- Aim for 25-40 high-quality events. All six categories should be
  represented — if you have zero events in a category, search harder
  for that category specifically before returning.

Return the JSON array now."""


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------

def event_id(event: dict) -> str:
    """Stable hash from title + start. Used for dedup across runs."""
    key = f"{event.get('title', '').strip().lower()}|{event.get('start', '')}"
    return hashlib.sha1(key.encode("utf-8")).hexdigest()[:12]


def load_existing() -> list[dict]:
    if not EVENTS_FILE.exists():
        return []
    try:
        with EVENTS_FILE.open() as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        print(f"warn: could not read {EVENTS_FILE}: {e}", file=sys.stderr)
        return []


def parse_event_start(event: dict) -> datetime | None:
    """Parse the start field into an aware datetime, or None if unparseable."""
    raw = event.get("start")
    if not raw:
        return None
    try:
        # fromisoformat handles 'YYYY-MM-DDTHH:MM:SS±HH:MM' in 3.11+
        dt = datetime.fromisoformat(raw)
        if dt.tzinfo is None:
            # Treat naive timestamps as Alaska time, but prune logic below
            # only needs a rough comparison so UTC is fine as fallback.
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except ValueError:
        return None


def prune_past(events: list[dict]) -> list[dict]:
    """Drop events whose start is before today (in UTC, generous)."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=12)
    kept = []
    for ev in events:
        dt = parse_event_start(ev)
        if dt is None:
            # If we can't parse it, keep it — better than silently losing data
            kept.append(ev)
        elif dt >= cutoff:
            kept.append(ev)
    return kept


def merge(existing: list[dict], fresh: list[dict]) -> list[dict]:
    """
    Merge fresh results into existing list.

    - Dedup by event_id (title + start)
    - Preserve firstSeen from existing entries
    - Stamp firstSeen on new entries
    - Newer fresh data wins on conflicting fields (description, location, etc.)
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    by_id: dict[str, dict] = {}

    for ev in existing:
        eid = ev.get("id") or event_id(ev)
        ev["id"] = eid
        by_id[eid] = ev

    for ev in fresh:
        eid = event_id(ev)
        ev["id"] = eid
        if eid in by_id:
            # update fields, preserve firstSeen
            first_seen = by_id[eid].get("firstSeen", now_iso)
            by_id[eid] = {**by_id[eid], **ev, "firstSeen": first_seen}
        else:
            ev["firstSeen"] = now_iso
            by_id[eid] = ev

    merged = list(by_id.values())
    # sort by start ascending; unparseable goes to the end
    merged.sort(key=lambda e: (parse_event_start(e) or datetime.max.replace(tzinfo=timezone.utc)))
    return merged


def extract_json_array(text: str) -> list[dict]:
    """Pull a JSON array out of the model response, tolerating stray prose."""
    text = text.strip()
    # strip markdown fences if present
    if text.startswith("```"):
        text = text.split("```", 2)[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.rsplit("```", 1)[0]
    # find first [ and last ]
    start = text.find("[")
    end = text.rfind("]")
    if start == -1 or end == -1 or end < start:
        raise ValueError("no JSON array found in response")
    return json.loads(text[start : end + 1])


def call_claude(start_date: str, end_date: str) -> list[dict]:
    """Call Claude with web search enabled and return parsed events."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY not set")

    client = anthropic.Anthropic(api_key=api_key)

    prompt = PROMPT_TEMPLATE.format(
        start_date=start_date,
        end_date=end_date,
        ak_tz=AK_TZ_LABEL,
    )

    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        tools=[{
            "type": "web_search_20250305",
            "name": "web_search",
            "max_uses": 20,
        }],
        messages=[{"role": "user", "content": prompt}],
    )

    # Concatenate all text blocks from the final response
    text_parts = [
        block.text for block in response.content
        if getattr(block, "type", None) == "text"
    ]
    full_text = "\n".join(text_parts)

    if not full_text.strip():
        raise RuntimeError("empty response from Claude")

    return extract_json_array(full_text)


def validate_event(ev: dict) -> bool:
    """Minimal sanity check before accepting a fresh event."""
    required = ("title", "start", "category", "sourceUrl")
    if not all(ev.get(k) for k in required):
        return False
    if ev["category"] not in {"fitness", "music", "food", "photography", "arts", "hiking", "major"}:
        return False
    if parse_event_start(ev) is None:
        return False
    return True


# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------

def main() -> int:
    today = datetime.now(timezone.utc).date()
    start_date = today.isoformat()
    end_date = (today + timedelta(days=LOOKAHEAD_DAYS)).isoformat()

    print(f"Fetching events from {start_date} to {end_date}...")

    existing = load_existing()
    print(f"Loaded {len(existing)} existing events")

    try:
        fresh = call_claude(start_date, end_date)
    except Exception as e:
        print(f"error: {e}", file=sys.stderr)
        return 1

    print(f"Got {len(fresh)} events from Claude")

    valid = [ev for ev in fresh if validate_event(ev)]
    dropped = len(fresh) - len(valid)
    if dropped:
        print(f"Dropped {dropped} events failing validation")

    pruned = prune_past(existing)
    pruned_count = len(existing) - len(pruned)
    if pruned_count:
        print(f"Pruned {pruned_count} past events")

    merged = merge(pruned, valid)
    new_count = len(merged) - len(pruned)
    print(f"Final count: {len(merged)} ({new_count} new)")

    EVENTS_FILE.write_text(json.dumps(merged, indent=2, ensure_ascii=False))
    print(f"Wrote {EVENTS_FILE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
