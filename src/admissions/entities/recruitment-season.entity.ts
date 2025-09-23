export interface AdmissionType {
    typeName: string;
    typeCode: number;
}

export interface RecruitmentUnit {
    unitName: string;
    unitCode: number;
}

export class RecruitmentSeason {
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
