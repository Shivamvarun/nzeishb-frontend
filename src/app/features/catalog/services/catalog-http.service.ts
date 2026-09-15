import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../../core/config/api.config';
import { CatalogModule } from '../models/catalog.models';
import { CatalogApiPort } from './catalog-api.port';

@Injectable()
export class CatalogHttpService implements CatalogApiPort {
  constructor(private readonly http: HttpClient) {}

  listModules(): Promise<readonly CatalogModule[]> {
    return firstValueFrom(this.http.get<readonly CatalogModule[]>(`${environment.apiBaseUrl}${API_ROUTES.catalog}`));
  }
}
