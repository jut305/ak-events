export type Category =
  | "fitness"
  | "music"
  | "food"
  | "photography"
  | "hiking"
  | "major";

export type FitnessSub =
  | "running"
  | "triathlon"
  | "cycling"
  | "ski-fat-bike"
  | "other";

export type TimeRange = "weekend" | "7d" | "30d";

export interface RawEvent {
  title: string;
  start: string;
  end: string | null;
  allDay: boolean;
  location: string;
  category: Category;
  description: string;
  sourceUrl: string;
  sourceName: string;
  id: string;
  firstSeen: string;
  // Optional — present after the prompt is updated to tag it explicitly
  familyFriendly?: boolean;
}

export interface AppEvent extends RawEvent {
  startDate: Date;
  endDate: Date | null;
  fitnessSub: FitnessSub | null;
  isNew: boolean;
  familyFriendly: boolean;
}
