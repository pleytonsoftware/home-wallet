# home-wallet: TECHNICAL FUNCTIONAL SPECIFICATION (v2.1)

## 1. PROJECT VISION

home-wallet is a high-end, multi-user household financial management platform. It solves the complexity of shared living expenses by automating the "Fair Share" calculation (proportional to income) and providing AI-driven foresight to prevent budget overruns.

---

## 2. TECHNOLOGY STACK

- **Framework:** Next.js 15 (App Router)
- **Internationalization:** `next-intl` (Cookie-based detection, Middleware routing)
- **Authentication:** `next-auth` (Auth.js) with `Prisma Adapter`
- **Database:** PostgreSQL via Prisma ORM
- **AI Engine:** Ollama Small LLM (local LLM inference for predictive insights)
- **Styling:** Tailwind CSS, Shadcn/UI, Tremor (Data Visualization)

---

## 3. ARCHITECTURAL CORE

### 3.1 Internationalization (i18n)

- **Pattern:** Middleware-based locale detection.
- **Persistence:** `NEXT_LOCALE` cookie for session-based language preference.
- **Structure:** Dynamic routing via `app/[locale]/...`
- **Dictionary Strategy:** JSON-based localized messages for every UI component.

### 3.2 Authentication & User Identity

- **Strategy:** Next-Auth Session management.
- **Relational Identity:** Every `User` is linked to a `Household`.
- **Roles:**
    - ADMIN: Can create households, invite members, change split strategies.
    - MEMBER: Can log personal/shared transactions and view household summaries.

### 3.3 Database Schema (Prisma/PostgreSQL)

Can be found at `prisma/schema.prisma`.

## 4. FEATURE SPECIFICATIONS & LOGIC

### 4.1 The Proportional Split Engine

This is the core logic for shared household expenses.

- **Function:** `calculateMemberShare(transactionAmount, householdId)`
- **Logic:**
    1. Fetch all members of the `householdId`.
    2. Sum the `income` of all members for the current month.
    3. Calculate the ratio: `MemberRatio = MemberIncome / TotalHouseholdIncome`.
    4. `MemberOwed = transactionAmount * MemberRatio`.
- **Outcome:** Automatically adjusts how much each person "owes" the shared pot based on their current month's salary.

### 4.2 Installment/Loan Management

- **Functionality:** When a user logs a transaction with `isInstallment: true`, the system creates an `Installment` record.
- **Tracking:** Every monthly payment reduces `remainingPayments`.
- **Dashboard View:** Shows a progress bar for every active debt/loan.

### 4.3 AI Predictive Intelligence (The Oracle)

- **Input:** Last 3-6 months of `Transaction` records + current month's logged data.
- **AI Prompt Context:** "You are a financial advisor. Based on the following transaction history [DATA_JSON], predict the total expenses for next month and identify if any category is trending upwards significantly."
- **Output Features:**
    - **Forecast:** Predicts `Total Income` vs `Total Expenses` for next month.
    - **Anomaly Alert:** "Warning: Your 'Dining Out' spending has increased 30% compared to your average."
    - **Debt Insight:** "You will finish your 'Macbook' payments in 3 months, freeing up €107/month."

---

## 5. UI/UX REQUIREMENTS

### 5.1 Dashboard Components

- **Summary Cards:**
    - Personal Balance (Income - Personal Expenses - My Share of Shared).
    - Household Balance (Total Household Income - Total Shared Expenses).
- **The "Next Month" Bridge:** A split view showing "Current Month" (Actuals) vs "Next Month" (AI Predictions).
- **Installment Timeline:** A visual timeline of upcoming final payments for loans.

### 5.2 Form Requirements

- **Conditional Inputs:** If `type` is `SHARED_EXPENSE`, show a "Split Method" dropdown (Proportional/50-50/Manual).
- **Installment Toggle:** If `isInstallment` is true, reveal "Total Term" and "Monthly Amount" inputs.
