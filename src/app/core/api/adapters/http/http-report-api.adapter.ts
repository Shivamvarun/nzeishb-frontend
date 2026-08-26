import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ReportApiPort } from '../../report/report-api.port';
import { GeneratedArtifact } from '../../report/report-api.models';

@Injectable()
export class HttpReportApiAdapter implements ReportApiPort {
  constructor(private readonly http: HttpClient) {}

  generateReport(solutionId: string): Promise<GeneratedArtifact> {
    return firstValueFrom(this.http.post<GeneratedArtifact>(`${environment.apiBaseUrl}/artifacts/report`, { solutionId }));
  }
}
