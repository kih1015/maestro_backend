import { Injectable, Inject } from '@nestjs/common';
import type { IStudentExportRepository } from '../interfaces/student-export-repository.interface';
import { STUDENT_EXPORT_REPOSITORY } from '../score-calculation.module';
import { ExportScoresDto } from '../dto/export.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class ScoreExportUseCase {
    constructor(
        @Inject(STUDENT_EXPORT_REPOSITORY)
        private readonly studentRepository: IStudentExportRepository,
    ) {}

    async exportScores(dto: ExportScoresDto): Promise<Buffer> {
        const rows = await this.studentRepository.exportFinalScores(dto.recruitmentSeasonId);

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');

        return XLSX.write(workbook, {
            type: 'buffer',
            bookType: 'xlsx',
        }) as Buffer;
    }
}
