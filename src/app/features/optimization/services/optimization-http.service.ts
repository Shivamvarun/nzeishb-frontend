import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../../core/config/api.config';
import { VpoParams } from '../../scenario/models/scenario.models';
import { Variant } from '../models/optimization.models';
import { OptimizationApiPort } from './optimization-api.port';

@Injectable()
export class OptimizationHttpService implements OptimizationApiPort {
  constructor(private readonly http: HttpClient) {}

  optimize(plotId: string, params: VpoParams): Promise<readonly Variant[]> {
    return firstValueFrom(this.http.post<readonly Variant[]>(`${environment.apiBaseUrl}${API_ROUTES.optimisation}`, { plotId, params }));
  }
}
