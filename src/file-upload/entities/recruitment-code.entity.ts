/**
 * 모집구분 코드 엔터티
 */
export class RecruitmentCode {
    readonly typeCode: string;
    readonly unitCode: string;

    constructor(typeCode: string, unitCode: string) {
        this.typeCode = typeCode;
        this.unitCode = unitCode;
    }

    /**
     * Mogib2 필드에서 모집구분 코드를 파싱
     * 형식: "typeCode-unitCode" (예: "01-001")
     */
    static fromMogib2(mogib2: string): RecruitmentCode {
        if (!mogib2 || typeof mogib2 !== 'string') {
            throw new Error('Invalid Mogib2 format');
        }

        const parts = mogib2.split('-');
        if (parts.length !== 2) {
            throw new Error(`Invalid Mogib2 format: ${mogib2}. Expected format: 'typeCode-unitCode'`);
        }

        return new RecruitmentCode(parts[0], parts[1]);
    }

    /**
     * Mogib2 형식으로 문자열 변환
     */
    toMogib2(): string {
        return `${this.typeCode}-${this.unitCode}`;
    }
}
