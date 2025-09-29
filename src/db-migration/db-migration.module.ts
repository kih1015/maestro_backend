import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbMigrationService } from './services/db-migration.service';
import { PostgresMigrationRepository } from './repository/postgres-migration.repository';
import { SqliteReaderRepository } from './repository/sqlite-reader.repository';
import { EventsModule } from '../events/events.module';

@Module({
    imports: [ConfigModule, EventsModule],
    providers: [DbMigrationService, PostgresMigrationRepository, SqliteReaderRepository],
    exports: [DbMigrationService],
})
export class DbMigrationModule {}
