import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { OptimizationApiPort } from '../../optimization/optimization-api.port';
import { API_ROUTES } from '../../api-routes';
import { Variant, VpoParams } from '../../optimization/optimization-api.models';

@Injectable()
export class HttpOptimizationApiAdapter implements OptimizationApiPort {
  constructor(private readonly http: HttpClient) {}

  optimize(plotId: string, params: VpoParams): Promise<readonly Variant[]> {
    return firstValueFrom(this.http.post<readonly Variant[]>(`${environment.apiBaseUrl}${API_ROUTES.optimisation}`, { plotId, params }));
  }
}
