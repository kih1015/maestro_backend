import { Module } from '@nestjs/common';
import { FileUploadController } from './file-upload.controller';
import { SubjectGroupMappingController } from './subject-group-mapping.controller';
import { FileUploadService } from './file-upload.service';
import { SubjectGroupMappingService } from './subject-group-mapping.service';
import { TempFileStorageService } from './temp-file-storage.service';
import { StudentBaseInfoRepository } from './repositories/student-base-info.repository';
import { SubjectScoreRepository } from './repositories/subject-score.repository';
import { SubjectGroupMappingRepository } from './repositories/subject-group-mapping.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [FileUploadController, SubjectGroupMappingController],
    providers: [
        FileUploadService,
        SubjectGroupMappingService,
        TempFileStorageService,
        StudentBaseInfoRepository,
        SubjectScoreRepository,
        SubjectGroupMappingRepository,
    ],
    exports: [FileUploadService, SubjectGroupMappingService, TempFileStorageService],
})
export class FileUploadModule {}
