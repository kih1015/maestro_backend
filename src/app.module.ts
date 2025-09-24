import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AdmissionsModule } from './admissions/admissions.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { EventsModule } from './events/events.module';
import { ScoreCalculationModule } from './score-calculation/score-calculation.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        AuthModule,
        UserModule,
        AdmissionsModule,
        FileUploadModule,
        EventsModule,
        ScoreCalculationModule,
    ],
})
export class AppModule {}
