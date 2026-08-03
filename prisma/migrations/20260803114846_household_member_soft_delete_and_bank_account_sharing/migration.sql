-- DropForeignKey
ALTER TABLE "bank_accounts" DROP CONSTRAINT "bank_accounts_household_member_id_fkey";

-- DropForeignKey
ALTER TABLE "household_member_payrolls" DROP CONSTRAINT "household_member_payrolls_household_member_id_fkey";

-- AlterTable
ALTER TABLE "household_members" ADD COLUMN     "removed_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "bank_account_members" (
    "id" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "household_member_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_account_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bank_account_members_household_member_id_idx" ON "bank_account_members"("household_member_id");

-- CreateIndex
CREATE UNIQUE INDEX "bank_account_members_bank_account_id_household_member_id_key" ON "bank_account_members"("bank_account_id", "household_member_id");

-- AddForeignKey
ALTER TABLE "household_member_payrolls" ADD CONSTRAINT "household_member_payrolls_household_member_id_fkey" FOREIGN KEY ("household_member_id") REFERENCES "household_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_household_member_id_fkey" FOREIGN KEY ("household_member_id") REFERENCES "household_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_account_members" ADD CONSTRAINT "bank_account_members_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_account_members" ADD CONSTRAINT "bank_account_members_household_member_id_fkey" FOREIGN KEY ("household_member_id") REFERENCES "household_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
