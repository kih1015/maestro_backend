import { Injectable } from '@nestjs/common';
import { StudentReadRepository } from '../repositories/student-read.repository';
import { ExportScoresDto } from '../dto/export.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class ScoreExportUseCase {
    constructor(private readonly studentRepository: StudentReadRepository) {}

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
