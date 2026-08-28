# How transactions work

This is a reference doc for the as-built transaction system — not a plan. For the original
pre-implementation design (now stale on recurrence, see below), see
`docs/plans/personal-transactions.md`.

## Model

```
MonthlyBudget (id, householdId, householdMemberId, month, type, status, targetAmount)
  └─ Transaction[] (monthlyBudgetId FK, required — every transaction belongs to exactly one budget)

Transaction (id, householdId, householdMemberId, monthlyBudgetId, name, amount, type,
             categoryId?, sourceAccountId?, note?, date, isRecurring, recurrenceRule?)
```

`recurrenceRule` is a loose JSON column, not a separate table — there is no `RecurrenceSeries`
model and no parent/child FK between transactions in a series. Series identity lives entirely
inside the JSON blob (see "Series identity" below).

`MonthlyBudget` has no stored `spent`/`total` field — every read computes totals live from its
`Transaction` rows (`prisma.transaction.groupBy`), so there's nothing to keep in sync server-side.

## Monthly budgets are created strictly in sequence

`createPersonalMonthlyBudget` (`src/app/actions/monthly-budget/create-personal-budget.ts`) only
accepts the month immediately after the member's latest created budget (`computeNextAvailableMonth`,
`src/lib/utils/monthly-budget.utils.ts`), or the current calendar month if none exist yet. Budgets
are never created automatically or on a schedule — always by explicit user action, one month at a
time. This invariant is what makes recurrence materialization tractable: there's always exactly one
well-defined "next" budget to carry a series into.

## Recurrence

### Frequencies

`RECURRENCE_FREQUENCY` (`src/lib/constants/recurrence.enum.ts`): `daily`, `weekly`, `biweekly`,
`monthly`, `yearly`. Combined with the generic `interval` field, this covers "every N days/weeks/
months/years" — e.g. `{ frequency: 'daily', interval: 3 }` is "every 3 days".

`RecurrenceRule` (`src/components/transactions/types.ts`):

```ts
interface RecurrenceRule {
 frequency: RECURRENCE_FREQUENCY
 interval?: number
 endDate?: string // mutually exclusive with occurrences
 occurrences?: number // mutually exclusive with endDate
 seriesId?: string // server-only bookkeeping, never user-editable
 occurrenceCount?: number // server-only bookkeeping, never user-editable
}
```

The user-facing Zod schemas (`create-transaction.ts`/`update-transaction.ts`) only ever validate
`frequency`/`interval`/`endDate`/`occurrences` — `seriesId`/`occurrenceCount` are stripped from any
client input by Zod's default `strip` mode and are only ever set by server code.

### Series identity

The first time a transaction is saved with `isRecurring: true`, the server stamps
`recurrenceRule.seriesId = <that transaction's own id>` and `occurrenceCount = 1` — this happens in
`src/app/actions/transaction/create.ts`, `update.ts` (only if the row doesn't already have a
`seriesId`), and `create-batch.ts` (Draft mode). Every later materialized occurrence of that series
carries the same `seriesId` forward, with `occurrenceCount` incrementing.

### Materialization — two trigger points, one shared walker

The actual per-budget walk (`materializeRecurringSeriesForward`, in
`src/app/actions/transaction/recurrence-materialization.ts`) is shared code: given an anchor
(a transaction's fields + its `recurrenceRule`) and a list of target budgets already sorted
ascending by month, it calls `computeOccurrencesInRange` (`src/lib/utils/recurrence.utils.ts`)
against each budget's `[month, lastDayOfMonthUtc(month)]` range in turn, creates a real
`Transaction` row per returned occurrence, and threads the anchor's `date`/`occurrenceCount`
forward across budgets — so `occurrences`/`endDate` caps and interval math stay correct even when
several already-existing future budgets get filled in one call. A WEEKLY or BIWEEKLY series can
produce several rows in a single month; MONTHLY/YEARLY typically produce one or zero.

There are two independent places this gets triggered from:

1. **A new `MonthlyBudget` is created** (`create-personal-budget.ts`, inside the same
   `prisma.$transaction` as the budget insert). Finds **all** of the member's `isRecurring: true`
   transactions — not just the previous month's budget, since a YEARLY series or `interval > 1` can
   legitimately produce zero occurrences in a given month, and scoping the lookup to only the
   immediately-preceding budget would silently drop the series the next time it's actually due.
   Groups them by `recurrenceRule.seriesId`, keeps only the max-`date` row per group as the anchor
   (a WEEKLY series already has several materialized rows in one month; treating every row as an
   independent anchor would multiply occurrences every hop), then walks forward into just the one
   newly created budget.
2. **A transaction becomes recurring in a month whose later budgets already exist**
   (`create.ts`/`update.ts`/`create-batch.ts`, only when the series is being originated — i.e. it
   doesn't have a `seriesId` yet). Since budgets aren't always created "just in time" relative to
   when a transaction is marked recurring, this looks up every already-existing `PERSONAL` budget
   for the member with `month` after the origin transaction's month (ascending order) and walks
   forward into all of them in one pass.

Editing an already-recurring transaction's other fields does not re-trigger forward-filling — only
the moment a series is originated does.

No client-side cache changes are needed for budgets that don't exist yet — a brand-new budget's
transaction list has never been cached, so navigating to it always fetches the already-materialized
rows fresh. For (2), the existing future budget's transaction-list query key can already be cached,
which is exactly why Fix 1 above matters — either invalidation path picks up the newly materialized
rows once implemented consistently.

### Stopping a series

There's no separate "cancelled" flag. Deleting a transaction with the "stop future occurrences"
choice (`deleteTransaction(transactionId, { cancelSeries: true })`,
`src/app/actions/transaction/delete.ts`) deletes that row and bulk-flips `isRecurring: false` on
every other transaction sharing the same `seriesId`. Since materialization only ever considers
`isRecurring: true` rows as candidate anchors, this is sufficient to stop the series from ever being
picked up again — no dedicated cancellation field needed. The choice is only exposed in the
transaction detail sheet (`transaction-detail-sheet.tsx`); Quick-add rows' inline delete has no
confirm dialog at all and always deletes just that one row.

## Client-side cache keys

Two independent React Query key families, and every mutation that touches transactions must
invalidate both:

- `MONTHLY_BUDGETS_QUERY_KEYS` (`src/components/monthly-budgets/constants/query-keys.ts`) —
  `all(householdId)` is the prefix; `monthlyBudget`/`monthlyBudgets` extend it. Drives the summary
  header's totals (computed server-side, live, on every GET).
- `TRANSACTIONS_QUERY_KEYS` (`src/components/transactions/constants/query-keys.ts`) —
  `transactions(householdId, monthlyBudgetId)`. Drives the actual transaction list
  (`DailyTimeline`) rendered on the monthly detail page.

Every create/update/delete path (Single mode's form, Draft mode's "Save all", Quick-add rows, the
detail sheet's delete) invalidates both key families after a successful mutation.
