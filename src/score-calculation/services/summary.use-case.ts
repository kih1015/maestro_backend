import { Injectable } from '@nestjs/common';
import { StudentReadRepository } from '../repositories/student-read.repository';
import { GetSummaryDto } from '../dto/summary.dto';

@Injectable()
export class SummaryUseCase {
    constructor(private readonly studentRepository: StudentReadRepository) {}

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
