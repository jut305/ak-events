export type Category =
  | "fitness"
  | "music"
  | "food"
  | "arts"
  | "hiking"
  | "major";

// Legacy categories that may still appear in older events.json data.
// Migrated at load time to the new shape.
export type LegacyCategory = "photography";

export type FitnessSub =
  | "running"
  | "triathlon"
  | "cycling"
  | "ski-fat-bike"
  | "other";

export type ArtsSub =
  | "visual"
  | "photography"
  | "theater"
  | "dance"
  | "other";

export type TimeRange = "weekend" | "7d" | "30d";

export interface RawEvent {
  title: string;
  start: string;
  end: string | null;
  allDay: boolean;
  location: string;
  category: Category | LegacyCategory;
  description: string;
  sourceUrl: string;
  sourceName: string;
  id: string;
  firstSeen: string;
  familyFriendly?: boolean;
  artsSub?: ArtsSub;
}

export interface AppEvent extends Omit<RawEvent, "category" | "artsSub"> {
  category: Category;
  startDate: Date;
  endDate: Date | null;
  fitnessSub: FitnessSub | null;
  artsSub: ArtsSub | null;
  isNew: boolean;
  familyFriendly: boolean;
}
