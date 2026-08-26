import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AuditApiPort } from '../../audit/audit-api.port';
import { GeneratedArtifact } from '../../audit/audit-api.models';

@Injectable()
export class HttpAuditApiAdapter implements AuditApiPort {
  constructor(private readonly http: HttpClient) {}

  generateBudget(solutionId: string): Promise<GeneratedArtifact> {
    return firstValueFrom(this.http.post<GeneratedArtifact>(`${environment.apiBaseUrl}/artifacts/budget`, { solutionId }));
  }
}
