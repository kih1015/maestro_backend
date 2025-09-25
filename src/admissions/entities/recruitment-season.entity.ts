/**
 * 전형 유형을 나타내는 인터페이스
 * 각 전형(일반전형, 학생부교과, 학생부종합 등)의 정보를 정의합니다.
 */
export interface AdmissionType {
    /** 전형 유형의 이름 (예: '일반전형', '학생부교과') */
    typeName: string;
    /** 전형 유형의 고유 코드 */
    typeCode: number;
}

/**
 * 모집 단위를 나타내는 인터페이스
 * 각 학과나 전공(컴퓨터공학과, 경영학과 등)의 정보를 정의합니다.
 */
export interface RecruitmentUnit {
    /** 모집 단위의 이름 (예: '컴퓨터공학과', '경영학과') */
    unitName: string;
    /** 모집 단위의 고유 코드 */
    unitCode: number;
}

/**
 * 모집 시즌을 나타내는 엔티티 클래스
 * 특정 연도와 시기의 대학 입학 모집에 대한 정보를 담습니다.
 * 해당 모집에서 사용되는 전형 유형들과 모집 단위들을 포함합니다.
 */
export class RecruitmentSeason {
    /**
     * RecruitmentSeason 생성자
     * @param id 모집 시즌의 고유 식별자
     * @param universityCode 대학 코드 (예: 'GACHON')
     * @param admissionYear 입학 연도 (예: 2024)
     * @param admissionName 입학 시기 이름 (예: '정시', '수시')
     * @param admissionTypes 해당 모집에서 사용되는 전형 유형 목록
     * @param recruitmentUnits 해당 모집에서 선발하는 모집 단위 목록
     * @param createdAt 생성 일시
     * @param updatedAt 최종 수정 일시
     */
    constructor(
        public readonly id: number,
        public readonly universityCode: string,
        public readonly admissionYear: number,
        public readonly admissionName: string,
        public readonly admissionTypes: AdmissionType[],
        public readonly recruitmentUnits: RecruitmentUnit[],
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    /**
     * 정적 팩토리 메서드를 통해 RecruitmentSeason 인스턴스를 생성합니다.
     * 객체 생성 시 데이터 검증과 안전한 초기화를 보장합니다.
     * @param data 모집 시즌 생성에 필요한 모든 속성을 포함한 데이터 객체
     * @returns 새로 생성된 RecruitmentSeason 인스턴스
     */
    static of(data: {
        id: number;
        universityCode: string;
        admissionYear: number;
        admissionName: string;
        admissionTypes: AdmissionType[];
        recruitmentUnits: RecruitmentUnit[];
        createdAt: Date;
        updatedAt: Date;
    }): RecruitmentSeason {
        return new RecruitmentSeason(
            data.id,
            data.universityCode,
            data.admissionYear,
            data.admissionName,
            data.admissionTypes,
            data.recruitmentUnits,
            data.createdAt,
            data.updatedAt,
        );
    }

    /**
     * 기존 모집 시즌 정보를 업데이트한 새로운 인스턴스를 반환합니다.
     * 불변 객체 패턴을 따라 기존 객체는 변경하지 않고 새 객체를 생성합니다.
     * 업데이트 시간은 자동으로 현재 시간으로 설정됩니다.
     * @param data 업데이트할 속성들 (선택적)
     * @returns 업데이트된 정보를 가진 새로운 RecruitmentSeason 인스턴스
     */
    update(data: {
        admissionYear?: number;
        admissionName?: string;
        admissionTypes?: AdmissionType[];
        recruitmentUnits?: RecruitmentUnit[];
    }): RecruitmentSeason {
        return new RecruitmentSeason(
            this.id,
            this.universityCode,
            data.admissionYear ?? this.admissionYear,
            data.admissionName ?? this.admissionName,
            data.admissionTypes ?? this.admissionTypes,
            data.recruitmentUnits ?? this.recruitmentUnits,
            this.createdAt,
            new Date(),
        );
    }
}
