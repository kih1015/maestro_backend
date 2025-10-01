/*
  Warnings:

  - Added the required column `calculationHandler` to the `subject_score_calculation_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."subject_score_calculation_details" ADD COLUMN     "calculationHandler" TEXT NOT NULL;
