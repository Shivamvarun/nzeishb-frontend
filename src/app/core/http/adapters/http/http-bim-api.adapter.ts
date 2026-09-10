import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { BimApiPort } from '../../../api/bim/bim-api.port';
import { API_ROUTES } from '../../../config/api.config';
import { GeneratedArtifact } from '../../../api/bim/bim-api.models';

@Injectable()
export class HttpBimApiAdapter implements BimApiPort {
  constructor(private readonly http: HttpClient) {}

  generateIfc(solutionId: string): Promise<GeneratedArtifact> {
    return firstValueFrom(this.http.post<GeneratedArtifact>(`${environment.apiBaseUrl}${API_ROUTES.bim}`, { solutionId }));
  }
}
