/*
  Warnings:

  - Added the required column `userId` to the `recruitment_seasons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."recruitment_seasons" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."recruitment_seasons" ADD CONSTRAINT "recruitment_seasons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
