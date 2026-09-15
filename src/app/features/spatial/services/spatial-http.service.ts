import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../../core/config/api.config';
import { Plot, SpatialContextSnapshot } from '../models/spatial.models';
import { SpatialApiPort } from './spatial-api.port';

@Injectable()
export class SpatialHttpService implements SpatialApiPort {
  constructor(private readonly http: HttpClient) {}

  listPlots(): Promise<readonly Plot[]> {
    return firstValueFrom(this.http.get<readonly Plot[]>(`${environment.apiBaseUrl}${API_ROUTES.spatial.plots}`));
  }

  findPlotByCadastralRef(reference: string): Promise<Plot | null> {
    return firstValueFrom(this.http.get<Plot | null>(`${environment.apiBaseUrl}${API_ROUTES.spatial.cadastral(reference)}`));
  }

  getContext(plotId: string, scenarioId: string): Promise<SpatialContextSnapshot> {
    if (!environment.spatialContextApiPath) {
      return Promise.reject(new Error('SpatialContext gateway route is not configured.'));
    }
    return firstValueFrom(this.http.get<SpatialContextSnapshot>(
      `${environment.apiBaseUrl}${environment.spatialContextApiPath}`,
      { params: { plotId, scenarioId } }
    ));
  }
}
