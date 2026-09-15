import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../../core/config/api.config';
import { GeneratedArtifact } from '../models/artifact.models';
import { ReportApiPort } from './report-api.port';

@Injectable()
export class ReportHttpService implements ReportApiPort {
  constructor(private readonly http: HttpClient) {}
  generateBudget(solutionId: string): Promise<GeneratedArtifact> {
    return firstValueFrom(this.http.post<GeneratedArtifact>(`${environment.apiBaseUrl}${API_ROUTES.reports.budget}`, { solutionId }));
  }
  generateReport(solutionId: string): Promise<GeneratedArtifact> {
    return firstValueFrom(this.http.post<GeneratedArtifact>(`${environment.apiBaseUrl}${API_ROUTES.reports.generate}`, { solutionId }));
  }
}
