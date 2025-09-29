import { Injectable } from '@nestjs/common';
import { StudentReadRepository } from '../repositories/student-read.repository';
import { SubjectScoreCalculationDetailRepository } from '../repositories/subject-score-calculation-detail.repository';
import { SubjectScoreCalculationDetail } from '../entities/student.entity';
import { ListStudentsDto } from '../dto/list-students.dto';
import { GetStudentDetailDto } from '../dto/student-detail.dto';
import { StudentFiltersDto } from '../dto/student-filters.dto';

export type StudentFilters = Omit<StudentFiltersDto, 'recruitmentSeasonId' | 'page' | 'pageSize' | 'q' | 'sort'>;

@Injectable()
export class StudentQueryUseCase {
    constructor(
        private readonly studentRepository: StudentReadRepository,
        private readonly subjectDetailRepository: SubjectScoreCalculationDetailRepository,
    ) {}

    async listStudents(dto: ListStudentsDto) {
        const filters: StudentFilters = {};

        // Copy filters from DTO
        if (dto.graduateYearFrom) filters.graduateYearFrom = dto.graduateYearFrom;
        if (dto.graduateYearTo) filters.graduateYearTo = dto.graduateYearTo;
        if (dto.graduateGrade) filters.graduateGrade = dto.graduateGrade;
        if (dto.recruitmentTypeCode) filters.recruitmentTypeCode = dto.recruitmentTypeCode;
        if (dto.recruitmentUnitCode) filters.recruitmentUnitCode = dto.recruitmentUnitCode;
        if (dto.applicantScCode) filters.applicantScCode = dto.applicantScCode;
        if (dto.calculationStatus) filters.calculationStatus = dto.calculationStatus;

        const result = await this.studentRepository.listStudents(
            dto.recruitmentSeasonId,
            dto.page || 1,
            dto.pageSize || 10,
            dto.q,
            Object.keys(filters).length > 0 ? filters : undefined,
            dto.sort,
        );

        return {
            success: true,
            data: result,
        };
    }

    async getStudentDetail(dto: GetStudentDetailDto) {
        const student = await this.studentRepository.findByIdentifyNumber(dto.recruitmentSeasonId, dto.identifyNumber);

        if (!student) {
            return {
                success: false,
                error: 'Student not found',
            };
        }

        const subjectScoreIds = student.subjectScores.map(s => s.id);
        const details = await this.subjectDetailRepository.findBySubjectScoreIds(subjectScoreIds);

        const detailBySubjectId = new Map<number, SubjectScoreCalculationDetail>();
        details.forEach(d => detailBySubjectId.set(d.subjectScoreId, d));

        // Helper function to compute percentile
        const computePercentileFromSubject = (subject: {
            studentCount?: string | number | null;
            rank?: string | number | null;
            sameRank?: string | number | null;
        }): number | null => {
            const totalCount = Number(subject.studentCount);
            const rank = Number(subject.rank);
            const sameRank = subject.sameRank != null ? Number(subject.sameRank) : null;
            const percentage = ((totalCount + 1 - rank - ((sameRank ?? 1) - 1) / 2) / totalCount) * 100;
            return Math.round(percentage * 10) / 10;
        };

        const applicableSubjects = student.subjectScores
            .filter(s => detailBySubjectId.get(s.id)?.isReflected === true)
            .map(s => {
                const d = detailBySubjectId.get(s.id);
                return {
                    seqNumber: s.seqNumber,
                    subjectName: s.subjectName,
                    subjectCode: s.subjectCode,
                    subjectGroup: s.subjectGroup ?? null,
                    subjectSeparationCode: s.subjectSeparationCode,
                    rankingGrade: s.rankingGrade,
                    achievement: s.achievement,
                    assessment: s.assessment ?? null,
                    percentile: computePercentileFromSubject(s),
                    convertedScore: d?.convertedScore ?? null,
                    convertedBaseValue: d?.convertedBaseValue ?? null,
                    conversionFormula: d?.conversionFormula ?? null,
                    unit: s.unit,
                    grade: s.grade,
                    term: s.term,
                };
            });

        const excludedSubjects = student.subjectScores
            .filter(s => detailBySubjectId.get(s.id)?.isReflected === false)
            .map(s => {
                const d = detailBySubjectId.get(s.id);
                return {
                    seqNumber: s.seqNumber,
                    subjectName: s.subjectName,
                    subjectCode: s.subjectCode,
                    subjectGroup: s.subjectGroup ?? null,
                    subjectSeparationCode: s.subjectSeparationCode,
                    reason: d?.nonReflectionReason ?? '제외',
                    assessment: s.assessment ?? null,
                    percentile: computePercentileFromSubject(s),
                    convertedScore: d?.convertedScore ?? null,
                    convertedBaseValue: d?.convertedBaseValue ?? null,
                    conversionFormula: d?.conversionFormula ?? null,
                    unit: s.unit,
                    grade: s.grade,
                    term: s.term,
                };
            });

        const { finalFormula, examNumber } = await this.studentRepository.getStudentExtraInfo(student.id);

        return {
            success: true,
            data: {
                id: student.id,
                identifyNumber: student.identifyNumber,
                examNumber: examNumber ?? '',
                graduateYear: student.graduateYear,
                graduateGrade: student.graduateGrade,
                applicantScCode: student.applicantScCode,
                recruitmentTypeCode: student.recruitmentTypeCode,
                recruitmentUnitCode: student.recruitmentUnitCode,
                applicableSubjects,
                excludedSubjects,
                finalFormula: finalFormula ?? null,
            },
        };
    }
}
