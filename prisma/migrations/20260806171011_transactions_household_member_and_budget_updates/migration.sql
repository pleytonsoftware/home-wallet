/*
  Warnings:

  - You are about to drop the column `dest_account_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[household_member_id,month,type]` on the table `monthly_budgets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `household_member_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Made the column `monthly_budget_id` on table `transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_monthly_budget_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_userId_fkey";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "color" TEXT NOT NULL DEFAULT 'gray';

-- AlterTable
ALTER TABLE "monthly_budgets" ADD COLUMN     "target_amount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "dest_account_id",
DROP COLUMN "userId",
ADD COLUMN     "household_member_id" TEXT NOT NULL,
ALTER COLUMN "monthly_budget_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "monthly_budgets_household_member_id_month_type_key" ON "monthly_budgets"("household_member_id", "month", "type");

-- CreateIndex
CREATE INDEX "transactions_household_member_id_idx" ON "transactions"("household_member_id");

-- CreateIndex
CREATE INDEX "transactions_monthly_budget_id_idx" ON "transactions"("monthly_budget_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_household_member_id_fkey" FOREIGN KEY ("household_member_id") REFERENCES "household_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_monthly_budget_id_fkey" FOREIGN KEY ("monthly_budget_id") REFERENCES "monthly_budgets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_source_account_id_fkey" FOREIGN KEY ("source_account_id") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
