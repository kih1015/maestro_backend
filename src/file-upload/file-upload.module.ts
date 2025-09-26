import { Module } from '@nestjs/common';
import { FileUploadController } from './file-upload.controller';
import { SubjectGroupMappingController } from './subject-group-mapping.controller';
import { FileUploadService } from './file-upload.service';
import { SubjectGroupMappingService } from './subject-group-mapping.service';
import { TempFileStorageService } from './temp-file-storage.service';
import { SubjectGroupMappingRepository } from './repositories/subject-group-mapping.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';
import { DbMigrationModule } from '../db-migration/db-migration.module';

@Module({
    imports: [PrismaModule, EventsModule, DbMigrationModule],
    controllers: [FileUploadController, SubjectGroupMappingController],
    providers: [FileUploadService, SubjectGroupMappingService, TempFileStorageService, SubjectGroupMappingRepository],
    exports: [FileUploadService, SubjectGroupMappingService, TempFileStorageService],
})
export class FileUploadModule {}
