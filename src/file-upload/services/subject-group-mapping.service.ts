import { Injectable } from '@nestjs/common';
import { SubjectGroupMappingRepository } from '../repositories/subject-group-mapping.repository';
import { TempFileStorageService } from './temp-file-storage.service';
import { SubjectGroupMapping } from '../entities/subject-group-mapping.entity';
import { SubjectGroupMappingResponseDto } from '../dto/subject-group-mapping-response.dto';
import { SubjectGroupMappingSummaryDto } from '../dto/subject-group-mapping-summary.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class SubjectGroupMappingService {
    constructor(
        private readonly subjectGroupMappingRepository: SubjectGroupMappingRepository,
        private readonly tempFileStorageService: TempFileStorageService,
    ) {}

    async uploadExcel(file: Express.Multer.File, recruitmentSeasonId: number): Promise<{ totalRows: number }> {
        // Save file temporarily
        const { path: filePath } = await this.tempFileStorageService.saveFile(file);

        try {
            const result = await this.processExcelFile(filePath, recruitmentSeasonId);
            return result;
        } finally {
            // Clean up temporary file
            await this.tempFileStorageService.remove(filePath);
        }
    }

    async getSummary(recruitmentSeasonId: number): Promise<SubjectGroupMappingSummaryDto | null> {
        const mappings = await this.subjectGroupMappingRepository.findByRecruitmentSeasonId(recruitmentSeasonId);

        if (mappings.length === 0) {
            return null;
        }

        // Get the latest upload time from the mappings
        const latestMapping = mappings.reduce((latest, current) =>
            current.createdAt > latest.createdAt ? current : latest,
        );

        return {
            recruitmentSeasonId,
            totalRows: mappings.length,
            uploadedAt: latestMapping.createdAt.toISOString(),
        };
    }

    async getDetails(recruitmentSeasonId: number): Promise<SubjectGroupMappingResponseDto[]> {
        const mappings = await this.subjectGroupMappingRepository.findByRecruitmentSeasonId(recruitmentSeasonId);

        return mappings.map(mapping => ({
            id: mapping.id,
            recruitmentSeasonId: mapping.recruitmentSeasonId,
            rowNo: mapping.rowNo,
            category: mapping.category,
            subjectGroup: mapping.subjectGroup,
            curriculumCode: mapping.curriculumCode,
            curriculumName: mapping.curriculumName,
            courseCode: mapping.courseCode,
            courseName: mapping.courseName,
            subjectCode: mapping.subjectCode,
            subjectName: mapping.subjectName,
            requiredYn: mapping.requiredYn,
            includedYn: mapping.includedYn,
            note: mapping.note,
            createdAt: mapping.createdAt.toISOString(),
            updatedAt: mapping.updatedAt.toISOString(),
        }));
    }

    private async processExcelFile(filePath: string, recruitmentSeasonId: number): Promise<{ totalRows: number }> {
        const workbook = XLSX.readFile(filePath);
        const sheetNames = workbook.SheetNames;

        // Use the last sheet, but prefer the first sheet with actual data
        let sheet = workbook.Sheets[sheetNames[sheetNames.length - 1]];
        for (let i = 1; i >= 0; i -= 1) {
            const candidate = workbook.Sheets[sheetNames[i]];
            const testAoa = XLSX.utils.sheet_to_json<(string | number | null)[]>(candidate, {
                header: 1,
                raw: false,
                defval: null,
            });
            const hasData = testAoa
                .slice(1)
                .some(r => Array.isArray(r) && r.some(c => c != null && String(c).trim() !== ''));
            if (hasData) {
                sheet = candidate;
                break;
            }
        }

        // Parse as array of arrays to handle column indices safely
        const aoa = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
            header: 1,
            raw: false,
            defval: null,
        });

        const normalizeHeader = (h: unknown): string => {
            if (h == null) return '';
            if (typeof h === 'object') return '';
            if (typeof h === 'string') return h.replace(/\uFEFF/g, '').trim();
            if (typeof h === 'number')
                return h
                    .toString()
                    .replace(/\uFEFF/g, '')
                    .trim();
            return '';
        };

        const headerRow = aoa[0] ?? [];
        const headers = headerRow.map(normalizeHeader);

        const indexOfAny = (candidates: string[]): number => {
            const lowered = headers.map(h => h.toLowerCase());
            for (const cand of candidates) {
                const c = cand.toLowerCase();
                const idx = lowered.indexOf(c);
                if (idx !== -1) return idx;
            }
            return -1;
        };

        const idxRowNo = indexOfAny(['No.', 'No', '번호']);
        const idxCategory = indexOfAny(['교과구분']);
        const idxSubjectGroup = indexOfAny(['교과군', '대학교과명']);
        const idxCurriculumCode = indexOfAny(['편제코드']);
        const idxCurriculumName = indexOfAny(['편제명']);
        const idxCourseCode = indexOfAny(['교과코드']);
        const idxCourseName = indexOfAny(['교과명']);
        const idxSubjectCode = indexOfAny(['과목코드']);
        const idxSubjectName = indexOfAny(['과목명']);
        const idxRequiredYn = indexOfAny(['필수']);
        const idxIncludedYn = indexOfAny(['반영']);
        const idxNote = indexOfAny(['비고']);

        const dataRows = aoa.slice(1); // Skip header row

        // Clear existing data for re-upload
        await this.subjectGroupMappingRepository.deleteByRecruitmentSeasonId(recruitmentSeasonId);

        const entities = dataRows
            .filter(r => Array.isArray(r))
            .map(rowArr => {
                const row = rowArr;

                const getIdx = (idx: number): unknown => (idx >= 0 && idx < row.length ? row[idx] : null);

                const toStringOrUndefined = (v: unknown): string | undefined => {
                    if (v == null) return undefined;
                    if (typeof v === 'object') return undefined;
                    if (typeof v === 'string') return v;
                    if (typeof v === 'number') return v.toString();
                    if (typeof v === 'boolean') return v.toString();
                    return undefined;
                };

                const toIntOrUndefined = (v: unknown): number | undefined => {
                    if (v == null || v === '') return undefined;
                    const n = Number(v);
                    return Number.isFinite(n) ? Math.trunc(n) : undefined;
                };

                return SubjectGroupMapping.create({
                    recruitmentSeasonId,
                    rowNo: toIntOrUndefined(getIdx(idxRowNo)),
                    category: toStringOrUndefined(getIdx(idxCategory)),
                    subjectGroup: toStringOrUndefined(getIdx(idxSubjectGroup)) ?? '',
                    curriculumCode: toStringOrUndefined(getIdx(idxCurriculumCode)),
                    curriculumName: toStringOrUndefined(getIdx(idxCurriculumName)),
                    courseCode: toStringOrUndefined(getIdx(idxCourseCode)),
                    courseName: toStringOrUndefined(getIdx(idxCourseName)),
                    subjectCode: toStringOrUndefined(getIdx(idxSubjectCode)),
                    subjectName: toStringOrUndefined(getIdx(idxSubjectName)),
                    requiredYn: toStringOrUndefined(getIdx(idxRequiredYn)),
                    includedYn: toStringOrUndefined(getIdx(idxIncludedYn)),
                    note: toStringOrUndefined(getIdx(idxNote)),
                });
            })
            // Filter out completely empty rows
            .filter(
                e =>
                    [
                        e.category,
                        e.subjectGroup,
                        e.curriculumCode,
                        e.curriculumName,
                        e.courseCode,
                        e.courseName,
                        e.subjectCode,
                        e.subjectName,
                        e.requiredYn,
                        e.includedYn,
                        e.note,
                    ].some(v => v != null && String(v).trim() !== '') || e.rowNo !== null,
            );

        await this.subjectGroupMappingRepository.saveMany(entities);

        return { totalRows: entities.length };
    }
}
