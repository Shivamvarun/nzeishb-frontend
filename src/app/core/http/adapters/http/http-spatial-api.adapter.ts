import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SpatialApiPort } from '../../../api/spatial/spatial-api.port';
import { API_ROUTES } from '../../../config/api.config';
import { Plot } from '../../../api/spatial/spatial-api.models';

@Injectable()
export class HttpSpatialApiAdapter implements SpatialApiPort {
  constructor(private readonly http: HttpClient) {}

  listPlots(): Promise<readonly Plot[]> {
    return firstValueFrom(this.http.get<readonly Plot[]>(`${environment.apiBaseUrl}${API_ROUTES.spatial.plots}`));
  }

  findPlotByCadastralRef(reference: string): Promise<Plot | null> {
    return firstValueFrom(this.http.get<Plot | null>(`${environment.apiBaseUrl}${API_ROUTES.spatial.cadastral(reference)}`));
  }
}
