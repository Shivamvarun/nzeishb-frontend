import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ScenarioApiPort } from '../../scenario/scenario-api.port';
import { API_ROUTES } from '../../api-routes';
import { Scenario, VpoParams } from '../../scenario/scenario-api.models';

@Injectable()
export class HttpScenarioApiAdapter implements ScenarioApiPort {
  constructor(private readonly http: HttpClient) {}

  saveScenario(scenario: Scenario, params: VpoParams, plotId: string): Promise<Scenario> {
    return firstValueFrom(this.http.put<Scenario>(`${environment.apiBaseUrl}${API_ROUTES.scenario(scenario.id)}`, { scenario, params, plotId }));
  }

  createScenario(plotId: string, params: VpoParams): Promise<Scenario> {
    return firstValueFrom(this.http.post<Scenario>(`${environment.apiBaseUrl}${API_ROUTES.scenarios}`, { plotId, params }));
  }

  deleteScenario(scenarioId: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${environment.apiBaseUrl}${API_ROUTES.scenario(scenarioId)}`));
  }
}
