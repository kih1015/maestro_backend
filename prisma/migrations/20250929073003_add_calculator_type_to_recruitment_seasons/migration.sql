-- CreateEnum
CREATE TYPE "public"."ConvertedBaseValue" AS ENUM ('GRADE', 'ACHIEVEMENT', 'PERCENTILE', 'Z_SCORE');

-- CreateEnum
CREATE TYPE "public"."CalculatorType" AS ENUM ('GACHEON');

-- CreateTable
CREATE TABLE "public"."admission_types" (
    "typeName" TEXT NOT NULL,
    "typeCode" INTEGER NOT NULL,
    "id" SERIAL NOT NULL,
    "recruitmentSeasonId" INTEGER NOT NULL,

    CONSTRAINT "admission_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."recruitment_seasons" (
    "universityCode" TEXT NOT NULL,
    "admissionYear" INTEGER NOT NULL,
    "admissionName" TEXT NOT NULL,
    "calculatorType" "public"."CalculatorType" NOT NULL DEFAULT 'GACHEON',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "recruitment_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."recruitment_units" (
    "unitName" TEXT NOT NULL,
    "unitCode" INTEGER NOT NULL,
    "id" SERIAL NOT NULL,
    "recruitmentSeasonId" INTEGER NOT NULL,

    CONSTRAINT "recruitment_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_base_infos" (
    "id" SERIAL NOT NULL,
    "recruitmentSeasonId" INTEGER NOT NULL,
    "recruitmentTypeCode" TEXT NOT NULL,
    "recruitmentUnitCode" TEXT NOT NULL,
    "identifyNumber" TEXT NOT NULL,
    "socialNumber" TEXT NOT NULL,
    "schoolCode" TEXT NOT NULL,
    "collegeAdmissionYear" TEXT NOT NULL,
    "seleScCode" TEXT NOT NULL,
    "applicantScCode" TEXT NOT NULL,
    "graduateYear" TEXT NOT NULL,
    "graduateGrade" TEXT NOT NULL,
    "masterSchoolYN" TEXT NOT NULL,
    "specializedSchoolYN" TEXT NOT NULL,
    "correctionRegisterYN" TEXT NOT NULL,
    "examNumber" TEXT NOT NULL,
    "uniqueFileName" TEXT,
    "pictureFileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_base_infos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_score_results" (
    "id" SERIAL NOT NULL,
    "studentBaseInfoId" INTEGER NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "ranking" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "finalFormula" TEXT,

    CONSTRAINT "student_score_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subject_group_mappings" (
    "id" SERIAL NOT NULL,
    "recruitmentSeasonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" TEXT,
    "courseCode" TEXT,
    "courseName" TEXT,
    "curriculumCode" TEXT,
    "curriculumName" TEXT,
    "includedYn" TEXT,
    "note" TEXT,
    "requiredYn" TEXT,
    "rowNo" INTEGER,
    "subjectCode" TEXT,
    "subjectGroup" TEXT,
    "subjectName" TEXT,

    CONSTRAINT "subject_group_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subject_score_calculation_details" (
    "id" SERIAL NOT NULL,
    "subjectScoreId" INTEGER NOT NULL,
    "isReflected" BOOLEAN NOT NULL DEFAULT false,
    "nonReflectionReason" TEXT,
    "convertedScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "conversionFormula" TEXT,
    "studentScoreResultStudentBaseInfoId" INTEGER,
    "convertedBaseValue" "public"."ConvertedBaseValue",

    CONSTRAINT "subject_score_calculation_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subject_scores" (
    "id" SERIAL NOT NULL,
    "studentBaseInfoId" INTEGER NOT NULL,
    "seqNumber" INTEGER NOT NULL,
    "socialNumber" TEXT NOT NULL,
    "schoolCode" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "organizationCode" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "subjectCode" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "term" INTEGER NOT NULL,
    "unit" TEXT,
    "assessment" TEXT,
    "rank" TEXT,
    "sameRank" TEXT,
    "studentCount" TEXT,
    "originalScore" TEXT,
    "avgScore" TEXT,
    "standardDeviation" TEXT,
    "rankingGrade" TEXT,
    "rankingGradeCode" TEXT,
    "achievement" TEXT,
    "achievementCode" TEXT,
    "achievementRatio" TEXT,
    "subjectSeparationCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "universityCode" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "public"."password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "student_base_infos_recruitmentSeasonId_idx" ON "public"."student_base_infos"("recruitmentSeasonId");

-- CreateIndex
CREATE INDEX "student_base_infos_recruitmentSeasonId_recruitmentTypeCode__idx" ON "public"."student_base_infos"("recruitmentSeasonId", "recruitmentTypeCode", "recruitmentUnitCode");

-- CreateIndex
CREATE UNIQUE INDEX "student_base_infos_recruitmentSeasonId_identifyNumber_key" ON "public"."student_base_infos"("recruitmentSeasonId", "identifyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "student_score_results_studentBaseInfoId_key" ON "public"."student_score_results"("studentBaseInfoId");

-- CreateIndex
CREATE INDEX "student_score_results_finalScore_idx" ON "public"."student_score_results"("finalScore");

-- CreateIndex
CREATE INDEX "student_score_results_ranking_idx" ON "public"."student_score_results"("ranking");

-- CreateIndex
CREATE INDEX "subject_group_mappings_recruitmentSeasonId_curriculumCode_c_idx" ON "public"."subject_group_mappings"("recruitmentSeasonId", "curriculumCode", "courseCode", "subjectCode");

-- CreateIndex
CREATE INDEX "subject_group_mappings_recruitmentSeasonId_idx" ON "public"."subject_group_mappings"("recruitmentSeasonId");

-- CreateIndex
CREATE UNIQUE INDEX "subject_score_calculation_details_subjectScoreId_key" ON "public"."subject_score_calculation_details"("subjectScoreId");

-- CreateIndex
CREATE INDEX "subject_score_calculation_details_isReflected_idx" ON "public"."subject_score_calculation_details"("isReflected");

-- CreateIndex
CREATE INDEX "subject_score_calculation_details_studentScoreResultStudent_idx" ON "public"."subject_score_calculation_details"("studentScoreResultStudentBaseInfoId");

-- CreateIndex
CREATE INDEX "subject_scores_grade_term_idx" ON "public"."subject_scores"("grade", "term");

-- CreateIndex
CREATE INDEX "subject_scores_organizationCode_courseCode_subjectCode_idx" ON "public"."subject_scores"("organizationCode", "courseCode", "subjectCode");

-- CreateIndex
CREATE INDEX "subject_scores_studentBaseInfoId_idx" ON "public"."subject_scores"("studentBaseInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "subject_scores_studentBaseInfoId_seqNumber_key" ON "public"."subject_scores"("studentBaseInfoId", "seqNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- AddForeignKey
ALTER TABLE "public"."admission_types" ADD CONSTRAINT "admission_types_recruitmentSeasonId_fkey" FOREIGN KEY ("recruitmentSeasonId") REFERENCES "public"."recruitment_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recruitment_units" ADD CONSTRAINT "recruitment_units_recruitmentSeasonId_fkey" FOREIGN KEY ("recruitmentSeasonId") REFERENCES "public"."recruitment_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_base_infos" ADD CONSTRAINT "student_base_infos_recruitmentSeasonId_fkey" FOREIGN KEY ("recruitmentSeasonId") REFERENCES "public"."recruitment_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_score_results" ADD CONSTRAINT "student_score_results_studentBaseInfoId_fkey" FOREIGN KEY ("studentBaseInfoId") REFERENCES "public"."student_base_infos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subject_group_mappings" ADD CONSTRAINT "subject_group_mappings_recruitmentSeasonId_fkey" FOREIGN KEY ("recruitmentSeasonId") REFERENCES "public"."recruitment_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subject_score_calculation_details" ADD CONSTRAINT "subject_score_calculation_details_studentScoreResultStuden_fkey" FOREIGN KEY ("studentScoreResultStudentBaseInfoId") REFERENCES "public"."student_score_results"("studentBaseInfoId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subject_score_calculation_details" ADD CONSTRAINT "subject_score_calculation_details_subjectScoreId_fkey" FOREIGN KEY ("subjectScoreId") REFERENCES "public"."subject_scores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subject_scores" ADD CONSTRAINT "subject_scores_studentBaseInfoId_fkey" FOREIGN KEY ("studentBaseInfoId") REFERENCES "public"."student_base_infos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
