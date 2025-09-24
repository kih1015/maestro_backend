import { Subject, StudentScoreResult, Student } from './student.entity';
import { GCNStudent } from './university-students.entity';

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
        recruitmentSeasonId: number;
    }): Student {
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

        switch (props.recruitmentSeasonId) {
            case 3:
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

            // case 2:
            //     return new HBWStudent(
            //         baseProps.id,
            //         baseProps.identifyNumber,
            //         baseProps.recruitmentTypeCode,
            //         baseProps.recruitmentUnitCode,
            //         baseProps.graduateYear,
            //         baseProps.applicantScCode,
            //         baseProps.graduateGrade,
            //         baseProps.subjectScores,
            //         baseProps.scoreResult,
            //     );
            //
            // case 1:
            //     return new SMWUStudent(
            //         baseProps.id,
            //         baseProps.identifyNumber,
            //         baseProps.recruitmentTypeCode,
            //         baseProps.recruitmentUnitCode,
            //         baseProps.graduateYear,
            //         baseProps.applicantScCode,
            //         baseProps.graduateGrade,
            //         baseProps.subjectScores,
            //         baseProps.scoreResult,
            //     );

            default:
                throw new Error(`Unsupported university code: ${props.recruitmentSeasonId}`);
        }
    }

    /**
     * Get supported university codes
     */
    static getSupportedUniversityCodes(): string[] {
        return ['GCN', 'GACHON', 'HBW', 'HANYANG', 'SMWU', 'SOOKMYUNG'];
    }
}
