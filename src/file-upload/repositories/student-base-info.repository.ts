import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StudentBaseInfo } from '../entities/student-base-info.entity';
import { StudentBaseInfoRepositoryInterface } from '../interfaces/student-base-info.repository.interface';

@Injectable()
export class StudentBaseInfoRepository implements StudentBaseInfoRepositoryInterface {
    constructor(private readonly prisma: PrismaService) {}

    async saveMany(students: StudentBaseInfo[]): Promise<StudentBaseInfo[]> {
        const createData = students.map(student => ({
            recruitmentSeasonId: student.recruitmentSeasonId,
            recruitmentTypeCode: student.recruitmentTypeCode,
            recruitmentUnitCode: student.recruitmentUnitCode,
            identifyNumber: student.identifyNumber,
            socialNumber: student.socialNumber,
            schoolCode: student.schoolCode,
            collegeAdmissionYear: student.collegeAdmissionYear,
            seleScCode: student.seleScCode,
            applicantScCode: student.applicantScCode,
            graduateYear: student.graduateYear,
            graduateGrade: student.graduateGrade,
            masterSchoolYN: student.masterSchoolYN,
            specializedSchoolYN: student.specializedSchoolYN,
            correctionRegisterYN: student.correctionRegisterYN,
            examNumber: student.examNumber,
            uniqueFileName: student.uniqueFileName,
            pictureFileName: student.pictureFileName,
            updatedAt: new Date(),
        }));

        await this.prisma.student_base_infos.createMany({
            data: createData,
        });

        // Return created records with IDs
        const created = await this.prisma.student_base_infos.findMany({
            where: {
                recruitmentSeasonId: students[0].recruitmentSeasonId,
                identifyNumber: {
                    in: students.map(s => s.identifyNumber),
                },
            },
        });

        return created.map(
            record =>
                new StudentBaseInfo({
                    id: record.id,
                    recruitmentSeasonId: record.recruitmentSeasonId,
                    recruitmentTypeCode: record.recruitmentTypeCode,
                    recruitmentUnitCode: record.recruitmentUnitCode,
                    identifyNumber: record.identifyNumber,
                    socialNumber: record.socialNumber,
                    schoolCode: record.schoolCode,
                    collegeAdmissionYear: record.collegeAdmissionYear,
                    seleScCode: record.seleScCode,
                    applicantScCode: record.applicantScCode,
                    graduateYear: record.graduateYear,
                    graduateGrade: record.graduateGrade,
                    masterSchoolYN: record.masterSchoolYN,
                    specializedSchoolYN: record.specializedSchoolYN,
                    correctionRegisterYN: record.correctionRegisterYN,
                    examNumber: record.examNumber,
                    uniqueFileName: record.uniqueFileName || undefined,
                    pictureFileName: record.pictureFileName || undefined,
                    subjectScores: [],
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                }),
        );
    }

    async findByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<StudentBaseInfo[]> {
        const records = await this.prisma.student_base_infos.findMany({
            where: { recruitmentSeasonId },
        });

        return records.map(
            record =>
                new StudentBaseInfo({
                    id: record.id,
                    recruitmentSeasonId: record.recruitmentSeasonId,
                    recruitmentTypeCode: record.recruitmentTypeCode,
                    recruitmentUnitCode: record.recruitmentUnitCode,
                    identifyNumber: record.identifyNumber,
                    socialNumber: record.socialNumber,
                    schoolCode: record.schoolCode,
                    collegeAdmissionYear: record.collegeAdmissionYear,
                    seleScCode: record.seleScCode,
                    applicantScCode: record.applicantScCode,
                    graduateYear: record.graduateYear,
                    graduateGrade: record.graduateGrade,
                    masterSchoolYN: record.masterSchoolYN,
                    specializedSchoolYN: record.specializedSchoolYN,
                    correctionRegisterYN: record.correctionRegisterYN,
                    examNumber: record.examNumber,
                    uniqueFileName: record.uniqueFileName || undefined,
                    pictureFileName: record.pictureFileName || undefined,
                    subjectScores: [],
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                }),
        );
    }

    async countByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<number> {
        return await this.prisma.student_base_infos.count({
            where: { recruitmentSeasonId },
        });
    }

    async deleteByRecruitmentSeasonId(recruitmentSeasonId: number): Promise<void> {
        await this.prisma.student_base_infos.deleteMany({
            where: { recruitmentSeasonId },
        });
    }

    async findById(id: number): Promise<StudentBaseInfo | null> {
        const record = await this.prisma.student_base_infos.findUnique({
            where: { id },
        });

        if (!record) return null;

        return new StudentBaseInfo({
            id: record.id,
            recruitmentSeasonId: record.recruitmentSeasonId,
            recruitmentTypeCode: record.recruitmentTypeCode,
            recruitmentUnitCode: record.recruitmentUnitCode,
            identifyNumber: record.identifyNumber,
            socialNumber: record.socialNumber,
            schoolCode: record.schoolCode,
            collegeAdmissionYear: record.collegeAdmissionYear,
            seleScCode: record.seleScCode,
            applicantScCode: record.applicantScCode,
            graduateYear: record.graduateYear,
            graduateGrade: record.graduateGrade,
            masterSchoolYN: record.masterSchoolYN,
            specializedSchoolYN: record.specializedSchoolYN,
            correctionRegisterYN: record.correctionRegisterYN,
            examNumber: record.examNumber,
            uniqueFileName: record.uniqueFileName || undefined,
            pictureFileName: record.pictureFileName || undefined,
            subjectScores: [],
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }

    async save(student: StudentBaseInfo): Promise<StudentBaseInfo> {
        const record = await this.prisma.student_base_infos.create({
            data: {
                recruitmentSeasonId: student.recruitmentSeasonId,
                recruitmentTypeCode: student.recruitmentTypeCode,
                recruitmentUnitCode: student.recruitmentUnitCode,
                identifyNumber: student.identifyNumber,
                socialNumber: student.socialNumber,
                schoolCode: student.schoolCode,
                collegeAdmissionYear: student.collegeAdmissionYear,
                seleScCode: student.seleScCode,
                applicantScCode: student.applicantScCode,
                graduateYear: student.graduateYear,
                graduateGrade: student.graduateGrade,
                masterSchoolYN: student.masterSchoolYN,
                specializedSchoolYN: student.specializedSchoolYN,
                correctionRegisterYN: student.correctionRegisterYN,
                examNumber: student.examNumber,
                uniqueFileName: student.uniqueFileName,
                pictureFileName: student.pictureFileName,
                updatedAt: new Date(),
            },
        });

        return new StudentBaseInfo({
            id: record.id,
            recruitmentSeasonId: record.recruitmentSeasonId,
            recruitmentTypeCode: record.recruitmentTypeCode,
            recruitmentUnitCode: record.recruitmentUnitCode,
            identifyNumber: record.identifyNumber,
            socialNumber: record.socialNumber,
            schoolCode: record.schoolCode,
            collegeAdmissionYear: record.collegeAdmissionYear,
            seleScCode: record.seleScCode,
            applicantScCode: record.applicantScCode,
            graduateYear: record.graduateYear,
            graduateGrade: record.graduateGrade,
            masterSchoolYN: record.masterSchoolYN,
            specializedSchoolYN: record.specializedSchoolYN,
            correctionRegisterYN: record.correctionRegisterYN,
            examNumber: record.examNumber,
            uniqueFileName: record.uniqueFileName || undefined,
            pictureFileName: record.pictureFileName || undefined,
            subjectScores: [],
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.student_base_infos.delete({
            where: { id },
        });
    }
}
