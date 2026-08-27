import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SpatialContextApiPort } from '../../spatial/spatial-context-api.port';
import { SpatialContextSnapshot } from '../../spatial/spatial-context-api.models';

@Injectable()
export class HttpSpatialContextApiAdapter implements SpatialContextApiPort {
  constructor(private readonly http: HttpClient) {}

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
