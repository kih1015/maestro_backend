import { Module } from '@nestjs/common';
import { FileUploadController } from './controllers/file-upload.controller';
import { SubjectGroupMappingController } from './controllers/subject-group-mapping.controller';
import { FileUploadService } from './services/file-upload.service';
import { SubjectGroupMappingService } from './services/subject-group-mapping.service';
import { TempFileStorageService } from './services/temp-file-storage.service';
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
