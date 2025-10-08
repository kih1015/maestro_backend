import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { StudentReadRepository } from '../repositories/student-read.repository';
import { SubjectScoreCalculationDetailRepository } from '../repositories/subject-score-calculation-detail.repository';
import { Student, SubjectScoreCalculationDetail } from '../entities/student.entity';
import { ListStudentsDto } from '../dto/list-students.dto';
import { GetStudentDetailDto } from '../dto/student-detail.dto';
import { StudentFiltersDto } from '../dto/student-filters.dto';
import { CALCULATORS } from '../calculator/calculator.tokens';
import { Calculator } from '../calculator/calculator';

export type StudentFilters = Omit<StudentFiltersDto, 'recruitmentSeasonId' | 'page' | 'pageSize' | 'q' | 'sort'>;

@Injectable()
export class StudentQueryUseCase {
    constructor(
        private readonly studentRepository: StudentReadRepository,
        private readonly subjectDetailRepository: SubjectScoreCalculationDetailRepository,
        @Inject(CALCULATORS) private readonly calculators: Calculator[],
    ) {}

    async listStudents(dto: ListStudentsDto) {
        const calculator: Calculator | undefined = this.calculators.find(calculator =>
            calculator.support(dto.calculatorType),
        );

        if (!calculator) {
            throw new BadRequestException('No calculator found.');
        }

        const admissionMapper = calculator.getAdmissionMapper();
        const unitMapper = calculator.getUnitMapper();

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
            data: {
                items: [
                    ...result.items.map(item => ({
                        ...item,
                        recruitmentTypeCode: admissionMapper[item.recruitmentTypeCode],
                        recruitmentUnitCode: unitMapper[item.recruitmentUnitCode],
                    })),
                ],
                total: result.total,
                completed: result.completed,
            },
        };
    }

    async getStudentDetail(dto: GetStudentDetailDto) {
        const student: Student | null = await this.studentRepository.findByIdentifyNumber(
            dto.recruitmentSeasonId,
            dto.identifyNumber,
        );

        const calculator: Calculator | undefined = this.calculators.find(calculator =>
            calculator.support(dto.calculatorType),
        );

        if (!calculator) {
            throw new BadRequestException('No calculator found.');
        }

        if (!student) {
            return {
                success: false,
                error: 'Student not found',
            };
        }

        const admissionMapper = calculator.getAdmissionMapper();
        const unitMapper = calculator.getUnitMapper();

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
                const d: SubjectScoreCalculationDetail | undefined = detailBySubjectId.get(s.id);
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
                    calculationHandler: d?.calculationHandler ?? null,
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
                    rankingGrade: s.rankingGrade,
                    achievement: s.achievement,
                    reason: d?.nonReflectionReason ?? '제외',
                    assessment: s.assessment ?? null,
                    percentile: computePercentileFromSubject(s),
                    convertedScore: d?.convertedScore ?? null,
                    convertedBaseValue: d?.convertedBaseValue ?? null,
                    conversionFormula: d?.conversionFormula ?? null,
                    calculationHandler: d?.calculationHandler ?? null,
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
                recruitmentTypeCode: admissionMapper[student.recruitmentTypeCode],
                recruitmentUnitCode: unitMapper[student.recruitmentUnitCode],
                applicableSubjects,
                excludedSubjects,
                finalFormula: finalFormula ?? null,
            },
        };
    }
}
