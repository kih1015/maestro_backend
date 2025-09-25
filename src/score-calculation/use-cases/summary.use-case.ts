import { Injectable, Inject } from '@nestjs/common';
import type { IStudentCountRepository } from '../interfaces/student-count-repository.interface';
import { STUDENT_COUNT_REPOSITORY } from '../score-calculation.module';
import { GetSummaryDto } from '../dto/summary.dto';

@Injectable()
export class SummaryUseCase {
    constructor(
        @Inject(STUDENT_COUNT_REPOSITORY)
        private readonly studentRepository: IStudentCountRepository,
    ) {}

    async getSummary(dto: GetSummaryDto) {
        const [totalStudents, totalResults] = await Promise.all([
            this.studentRepository.countStudents(dto.recruitmentSeasonId),
            this.studentRepository.countResultsForSeason(dto.recruitmentSeasonId),
        ]);

        return {
            success: true,
            data: {
                totalStudents,
                totalResults,
                studentsWithResults: totalResults,
            },
        };
    }
}
