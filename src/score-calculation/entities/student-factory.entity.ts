import { Subject, StudentScoreResult } from './student.entity';
import { GCNStudent, HBWStudent, SMWUStudent, UniversityStudent } from './university-students.entity';

export class StudentFactory {
    /**
     * Create a university-specific student instance based on university code
     */
    static create(props: {
        id?: number;
        identifyNumber: string;
        recruitmentTypeCode: string;
        recruitmentUnitCode: string;
        graduateYear: string;
        applicantScCode: string;
        graduateGrade: string;
        subjectScores: Subject[];
        scoreResult?: StudentScoreResult | null;
        universityCode: string;
    }): UniversityStudent {
        const baseProps = {
            id: props.id ?? 0,
            identifyNumber: props.identifyNumber,
            recruitmentTypeCode: props.recruitmentTypeCode,
            recruitmentUnitCode: props.recruitmentUnitCode,
            graduateYear: props.graduateYear,
            applicantScCode: props.applicantScCode,
            graduateGrade: props.graduateGrade,
            subjectScores: props.subjectScores,
            scoreResult: props.scoreResult ?? null,
        };

        switch (props.universityCode.toUpperCase()) {
            case 'GCN':
            case 'GACHON':
                return new GCNStudent(
                    baseProps.id,
                    baseProps.identifyNumber,
                    baseProps.recruitmentTypeCode,
                    baseProps.recruitmentUnitCode,
                    baseProps.graduateYear,
                    baseProps.applicantScCode,
                    baseProps.graduateGrade,
                    baseProps.subjectScores,
                    baseProps.scoreResult,
                );

            case 'HBW':
            case 'HANYANG':
                return new HBWStudent(
                    baseProps.id,
                    baseProps.identifyNumber,
                    baseProps.recruitmentTypeCode,
                    baseProps.recruitmentUnitCode,
                    baseProps.graduateYear,
                    baseProps.applicantScCode,
                    baseProps.graduateGrade,
                    baseProps.subjectScores,
                    baseProps.scoreResult,
                );

            case 'SMWU':
            case 'SOOKMYUNG':
                return new SMWUStudent(
                    baseProps.id,
                    baseProps.identifyNumber,
                    baseProps.recruitmentTypeCode,
                    baseProps.recruitmentUnitCode,
                    baseProps.graduateYear,
                    baseProps.applicantScCode,
                    baseProps.graduateGrade,
                    baseProps.subjectScores,
                    baseProps.scoreResult,
                );

            default:
                throw new Error(`Unsupported university code: ${props.universityCode}`);
        }
    }

    /**
     * Get supported university codes
     */
    static getSupportedUniversityCodes(): string[] {
        return ['GCN', 'GACHON', 'HBW', 'HANYANG', 'SMWU', 'SOOKMYUNG'];
    }
}
