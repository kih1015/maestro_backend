import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbMigrationService } from './services/db-migration.service';
import { PostgresMigrationService } from './services/postgres-migration.service';
import { SqliteReaderService } from './services/sqlite-reader.service';
import { EventsModule } from '../events/events.module';

@Module({
    imports: [ConfigModule, EventsModule],
    providers: [DbMigrationService, PostgresMigrationService, SqliteReaderService],
    exports: [DbMigrationService],
})
export class DbMigrationModule {}
