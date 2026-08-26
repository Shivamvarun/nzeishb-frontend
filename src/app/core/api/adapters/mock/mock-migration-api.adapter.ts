import { Injectable } from '@angular/core';
import { MigrationApiPort } from '../../migration/migration-api.port';

@Injectable()
export class MockMigrationApiAdapter implements MigrationApiPort {}
