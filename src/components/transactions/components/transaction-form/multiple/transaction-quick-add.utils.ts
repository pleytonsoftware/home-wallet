/**
 * Shared grid-template for Quick add rows. Same fixed-length rationale as `DRAFT_ROW_GRID_CLASS`
 * (avoids `auto`-column drift between independent grid instances — the header, display rows, and
 * edit/input rows, which show 1 vs. 2 trailing action buttons). The trailing actions column is
 * sized for the wider case (accept+reject, two icon buttons) — a display row's single "..." button
 * just sits with a little extra room in that same column.
 */
export const QUICK_ADD_ROW_GRID_CLASS = 'grid grid-cols-[4.5rem_1fr_8rem_1fr_1fr_9rem_2.5rem_4.5rem] items-center gap-2'
