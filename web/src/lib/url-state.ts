import { useCallback, useEffect, useState } from "react";
import type { ArtsSub, Category, FitnessSub, TimeRange } from "../types";
import {
  ARTS_SUB_ORDER,
  CATEGORY_ORDER,
  FITNESS_SUB_ORDER,
} from "./categories";
import { DEFAULT_FILTERS, type FilterState } from "./filters";

const RANGE_VALUES: TimeRange[] = ["weekend", "7d", "30d"];

function parseList<T extends string>(
  raw: string | null,
  allowed: readonly T[]
): T[] {
  if (!raw) return [];
  const allowedSet = new Set<string>(allowed);
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "" && s !== "all" && allowedSet.has(s)) as T[];
}

function parseFromUrl(search: string): FilterState {
  const params = new URLSearchParams(search);
  const range = params.get("when") as TimeRange | null;
  const categories = parseList<Category>(params.get("cat"), CATEGORY_ORDER);
  const fitnessSubs = parseList<FitnessSub>(
    params.get("fsub"),
    FITNESS_SUB_ORDER
  );
  const artsSubs = parseList<ArtsSub>(params.get("asub"), ARTS_SUB_ORDER);
  const family = params.get("family") === "1";
  const query = params.get("q") ?? "";

  return {
    range: range && RANGE_VALUES.includes(range) ? range : DEFAULT_FILTERS.range,
    categories,
    fitnessSubs,
    artsSubs,
    family,
    query,
  };
}

function serializeToUrl(state: FilterState): string {
  const params = new URLSearchParams();
  if (state.range !== DEFAULT_FILTERS.range) params.set("when", state.range);
  if (state.categories.length > 0) params.set("cat", state.categories.join(","));
  if (state.fitnessSubs.length > 0)
    params.set("fsub", state.fitnessSubs.join(","));
  if (state.artsSubs.length > 0) params.set("asub", state.artsSubs.join(","));
  if (state.family) params.set("family", "1");
  if (state.query) params.set("q", state.query);
  const s = params.toString();
  return s ? `?${s}` : window.location.pathname;
}

export function useUrlFilters(): [
  FilterState,
  (next: Partial<FilterState>) => void,
] {
  const [state, setState] = useState<FilterState>(() =>
    parseFromUrl(window.location.search)
  );

  useEffect(() => {
    const onPop = () => setState(parseFromUrl(window.location.search));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const update = useCallback((patch: Partial<FilterState>) => {
    setState((prev) => {
      const next: FilterState = { ...prev, ...patch };
      // If a parent category is no longer selected, drop its subs
      if (
        next.categories.length > 0 &&
        !next.categories.includes("fitness")
      ) {
        next.fitnessSubs = [];
      }
      if (
        next.categories.length > 0 &&
        !next.categories.includes("arts")
      ) {
        next.artsSubs = [];
      }
      const url = serializeToUrl(next);
      window.history.replaceState({}, "", url);
      return next;
    });
  }, []);

  return [state, update];
}
