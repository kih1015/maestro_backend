import { Module } from '@nestjs/common';
import { AdmissionsController } from './admissions.controller';
import { AdmissionsRepository } from './admissions.repository';
import { CreateRecruitmentSeasonService } from './use-cases/create-recruitment-season.service';
import { GetRecruitmentSeasonsService } from './use-cases/get-recruitment-seasons.service';
import { UpdateRecruitmentSeasonService } from './use-cases/update-recruitment-season.service';
import { DeleteRecruitmentSeasonService } from './use-cases/delete-recruitment-season.service';

@Module({
    controllers: [AdmissionsController],
    providers: [
        AdmissionsRepository,
        CreateRecruitmentSeasonService,
        GetRecruitmentSeasonsService,
        UpdateRecruitmentSeasonService,
        DeleteRecruitmentSeasonService,
    ],
    exports: [
        CreateRecruitmentSeasonService,
        GetRecruitmentSeasonsService,
        UpdateRecruitmentSeasonService,
        DeleteRecruitmentSeasonService,
    ],
})
export class AdmissionsModule {}
