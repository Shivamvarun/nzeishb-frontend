import { InjectionToken } from '@angular/core';
import { CatalogModule } from './catalog-api.models';

export interface CatalogApiPort {
  listModules(): Promise<readonly CatalogModule[]>;
}

export const CATALOG_API = new InjectionToken<CatalogApiPort>('CATALOG_API');
