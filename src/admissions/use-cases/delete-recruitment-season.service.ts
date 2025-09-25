import { Injectable, NotFoundException } from '@nestjs/common';
import { AdmissionsRepository } from '../admissions.repository';

@Injectable()
export class DeleteRecruitmentSeasonService {
    constructor(private admissionsRepository: AdmissionsRepository) {}

    async execute(id: number): Promise<void> {
        const exists = await this.admissionsRepository.exists(id);
        if (!exists) {
            throw new NotFoundException('Recruitment season not found');
        }

        await this.admissionsRepository.delete(id);
    }
}
