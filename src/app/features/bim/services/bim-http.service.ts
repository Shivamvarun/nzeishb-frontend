import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../../core/config/api.config';
import { GeneratedArtifact } from '../../reports/models/artifact.models';
import { BimApiPort } from './bim-api.port';

@Injectable()
export class BimHttpService implements BimApiPort {
  constructor(private readonly http: HttpClient) {}

  generateIfc(solutionId: string): Promise<GeneratedArtifact> {
    return firstValueFrom(this.http.post<GeneratedArtifact>(`${environment.apiBaseUrl}${API_ROUTES.bim}`, { solutionId }));
  }
}
