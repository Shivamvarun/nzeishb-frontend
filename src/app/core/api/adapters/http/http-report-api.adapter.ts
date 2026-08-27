import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ReportApiPort } from '../../report/report-api.port';
import { API_ROUTES } from '../../api-routes';
import { GeneratedArtifact } from '../../../models/app.models';

@Injectable()
export class HttpReportApiAdapter implements ReportApiPort {
  constructor(private readonly http: HttpClient) {}
  generateBudget(solutionId: string): Promise<GeneratedArtifact> { return firstValueFrom(this.http.post<GeneratedArtifact>(`${environment.apiBaseUrl}${API_ROUTES.reports.budget}`, { solutionId })); }
  generateReport(solutionId: string): Promise<GeneratedArtifact> { return firstValueFrom(this.http.post<GeneratedArtifact>(`${environment.apiBaseUrl}${API_ROUTES.reports.generate}`, { solutionId })); }
}
