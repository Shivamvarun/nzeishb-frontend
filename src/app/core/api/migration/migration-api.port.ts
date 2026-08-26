import { InjectionToken } from '@angular/core';

export interface MigrationApiPort {}

export const MIGRATION_API = new InjectionToken<MigrationApiPort>('MIGRATION_API');
