/**
 * Heuristic family-friendly classifier.
 *
 * Used until events.json carries an explicit `familyFriendly` field — the
 * prompt is being updated to set it on regeneration. Conservative on purpose:
 * false negatives are better than tagging an adults-only event as family.
 */
export function isFamilyFriendlyHeuristic(
  title: string,
  description: string
): boolean {
  const text = `${title} ${description}`.toLowerCase();

  // Hard negatives win
  if (/\b(21\+|18\+|adults? only)\b/.test(text)) return false;

  // Strong positives
  if (
    /\b(family[- ]?friendly|family event|kid[s']?[- ]?friendly|all[- ]?ages|toddler|babies?|children|kids|youth)\b/.test(
      text
    )
  ) {
    return true;
  }

  // Specific event patterns that are reliably family
  if (
    /\b(girls on the run|circus|farmers? market|festival|art fair|street fair|community)\b/.test(
      text
    )
  ) {
    return true;
  }

  return false;
}
