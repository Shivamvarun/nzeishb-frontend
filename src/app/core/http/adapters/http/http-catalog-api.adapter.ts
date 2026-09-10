import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CatalogApiPort } from '../../../api/catalog/catalog-api.port';
import { API_ROUTES } from '../../../config/api.config';
import { CatalogModule } from '../../../api/catalog/catalog-api.models';

@Injectable()
export class HttpCatalogApiAdapter implements CatalogApiPort {
  constructor(private readonly http: HttpClient) {}

  listModules(): Promise<readonly CatalogModule[]> {
    return firstValueFrom(this.http.get<readonly CatalogModule[]>(`${environment.apiBaseUrl}${API_ROUTES.catalog}`));
  }
}
