import { Users } from "lucide-react";
import type { ReactNode } from "react";
import type { Category, FitnessSub, TimeRange } from "../types";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  FITNESS_SUB_LABEL,
  FITNESS_SUB_ORDER,
} from "../lib/categories";
import { Chip } from "./Chip";

interface FilterBarProps {
  range: TimeRange;
  categories: Category[];
  subs: FitnessSub[];
  family: boolean;
  onRangeChange: (r: TimeRange) => void;
  onToggleCategory: (c: Category) => void;
  onClearCategories: () => void;
  onToggleSub: (s: FitnessSub) => void;
  onClearSubs: () => void;
  onFamilyChange: (v: boolean) => void;
}

const RANGE_LABELS: Record<TimeRange, string> = {
  weekend: "This weekend",
  "7d": "Next 7 days",
  "30d": "Next 30 days",
};

const FAMILY_ACCENT = "#8b3a4c"; // burgundy

function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-1 pb-1.5">
      <span className="font-display-italic text-[0.75rem] text-ink-muted leading-none">
        {children}
      </span>
      <div className="flex-1 h-px bg-line" />
    </div>
  );
}

export function FilterBar({
  range,
  categories,
  subs,
  family,
  onRangeChange,
  onToggleCategory,
  onClearCategories,
  onToggleSub,
  onClearSubs,
  onFamilyChange,
}: FilterBarProps) {
  const allCategoriesActive = categories.length === 0;
  const fitnessActive = categories.includes("fitness");
  const allSubsActive = subs.length === 0;

  return (
    <div className="px-5 pb-4 space-y-2">
      <GroupLabel>when</GroupLabel>
      <div className="scroll-x flex gap-1.5 -mx-5 pl-5 pr-6">
        {(Object.keys(RANGE_LABELS) as TimeRange[]).map((r) => (
          <Chip
            key={r}
            selected={range === r}
            onClick={() => onRangeChange(r)}
          >
            {RANGE_LABELS[r]}
          </Chip>
        ))}
      </div>

      <div className="pt-2">
        <GroupLabel>what</GroupLabel>
      </div>
      <div className="scroll-x flex gap-1.5 -mx-5 pl-5 pr-6">
        <Chip selected={allCategoriesActive} onClick={onClearCategories}>
          All
        </Chip>
        {CATEGORY_ORDER.map((cat) => (
          <Chip
            key={cat}
            selected={categories.includes(cat)}
            onClick={() => onToggleCategory(cat)}
            accentColor={CATEGORY_META[cat].color}
          >
            {CATEGORY_META[cat].label}
          </Chip>
        ))}
      </div>

      {fitnessActive && (
        <div className="scroll-x flex gap-1.5 -mx-5 pl-5 pr-6 pt-0.5">
          <Chip selected={allSubsActive} onClick={onClearSubs}>
            All fitness
          </Chip>
          {FITNESS_SUB_ORDER.map((s) => (
            <Chip
              key={s}
              selected={subs.includes(s)}
              onClick={() => onToggleSub(s)}
            >
              {FITNESS_SUB_LABEL[s]}
            </Chip>
          ))}
        </div>
      )}

      <div className="pt-2">
        <GroupLabel>audience</GroupLabel>
      </div>
      <div className="flex gap-1.5">
        <Chip
          selected={family}
          onClick={() => onFamilyChange(!family)}
          accentColor={FAMILY_ACCENT}
        >
          <span className="inline-flex items-center gap-1.5">
            <Users size={14} strokeWidth={2.25} />
            Family-friendly
          </span>
        </Chip>
      </div>
    </div>
  );
}
