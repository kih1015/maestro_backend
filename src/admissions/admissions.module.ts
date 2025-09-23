import { Module } from '@nestjs/common';
import { AdmissionsController } from './admissions.controller';
import { AdmissionsService } from './admissions.service';
import { AdmissionsRepository } from './admissions.repository';

@Module({
    controllers: [AdmissionsController],
    providers: [AdmissionsService, AdmissionsRepository],
    exports: [AdmissionsService],
})
export class AdmissionsModule {}
