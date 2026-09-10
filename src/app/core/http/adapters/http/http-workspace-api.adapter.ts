import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { WorkspaceApiPort } from '../../../api/workspace/workspace-api.port';
import { API_ROUTES } from '../../../config/api.config';
import { WorkspaceSnapshot } from '../../../api/workspace/workspace-api.models';

@Injectable()
export class HttpWorkspaceApiAdapter implements WorkspaceApiPort {
  constructor(private readonly http: HttpClient) {}

  loadWorkspace(): Promise<WorkspaceSnapshot> {
    return firstValueFrom(this.http.get<WorkspaceSnapshot>(`${environment.apiBaseUrl}${API_ROUTES.workspace}`));
  }
}
