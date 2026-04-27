import type { ArtsSub, Category, FitnessSub } from "../types";

export const CATEGORY_ORDER: Category[] = [
  "fitness",
  "music",
  "food",
  "hiking",
  "arts",
  "major",
];

export const CATEGORY_META: Record<
  Category,
  { label: string; color: string; soft: string }
> = {
  fitness: {
    label: "Fitness",
    color: "var(--color-cat-fitness)",
    soft: "rgba(184, 92, 56, 0.10)",
  },
  music: {
    label: "Music",
    color: "var(--color-cat-music)",
    soft: "rgba(45, 74, 107, 0.10)",
  },
  food: {
    label: "Food",
    color: "var(--color-cat-food)",
    soft: "rgba(184, 134, 43, 0.12)",
  },
  hiking: {
    label: "Hiking",
    color: "var(--color-cat-hiking)",
    soft: "rgba(63, 94, 79, 0.12)",
  },
  arts: {
    label: "Arts",
    color: "var(--color-cat-arts)",
    soft: "rgba(74, 110, 108, 0.12)",
  },
  major: {
    label: "Major",
    color: "var(--color-cat-major)",
    soft: "rgba(139, 58, 76, 0.10)",
  },
};

// ---------- Fitness subcategories ----------

export const FITNESS_SUB_ORDER: FitnessSub[] = [
  "running",
  "triathlon",
  "cycling",
  "ski-fat-bike",
  "other",
];

export const FITNESS_SUB_LABEL: Record<FitnessSub, string> = {
  running: "Running",
  triathlon: "Triathlon",
  cycling: "Cycling",
  "ski-fat-bike": "Ski / Fat bike",
  other: "Other",
};

export function classifyFitness(
  title: string,
  description: string
): FitnessSub {
  const text = `${title} ${description}`.toLowerCase();
  if (/\b(triathlon|tri\b|duathlon)\b/.test(text)) return "triathlon";
  if (/\b(ski|fat bike|fatbike|skiing|nordic)\b/.test(text))
    return "ski-fat-bike";
  if (/\b(bike to work|bike|cycling|cyclocross|cycle)\b/.test(text))
    return "cycling";
  if (
    /\b(\d+\s*k\b|5k|10k|12k|6k|half marathon|marathon|run\/walk|trail run|run|walk)\b/.test(
      text
    )
  )
    return "running";
  return "other";
}

// ---------- Arts subcategories ----------

export const ARTS_SUB_ORDER: ArtsSub[] = [
  "visual",
  "photography",
  "theater",
  "dance",
  "other",
];

export const ARTS_SUB_LABEL: Record<ArtsSub, string> = {
  visual: "Visual art",
  photography: "Photography",
  theater: "Theater",
  dance: "Dance",
  other: "Other",
};

export function classifyArts(title: string, description: string): ArtsSub {
  const text = `${title} ${description}`.toLowerCase();
  // Order matters — more specific before generic
  if (/\b(photo|photograph|aurora photo)/.test(text)) return "photography";
  if (/\b(theater|theatre|play\b|playhouse|musical|broadway|drama)/.test(text))
    return "theater";
  if (/\b(dance|ballet|recital|choreograph)/.test(text)) return "dance";
  if (
    /\b(gallery|museum|exhibition|exhibit|first friday|art opening|painting|sculpture|illustration|tlingit|native art)/.test(
      text
    )
  )
    return "visual";
  if (/\b(comedy|comedian|stand[- ]?up|improv|reading|poet|literary|book|film|cinema|movie|screening)/.test(text))
    return "other";
  return "other";
}
