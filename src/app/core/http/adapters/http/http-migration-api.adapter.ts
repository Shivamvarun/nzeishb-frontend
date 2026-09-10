import { Injectable } from '@angular/core';
import { MigrationApiPort } from '../../../api/migration/migration-api.port';

@Injectable()
export class HttpMigrationApiAdapter implements MigrationApiPort {}
