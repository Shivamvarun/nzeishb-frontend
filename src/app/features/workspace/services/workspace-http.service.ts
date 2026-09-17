import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../../core/config/api.config';
import { WorkspaceSnapshot } from '../models/workspace.models';
import { WorkspaceApiPort } from './workspace-api.port';

@Injectable()
export class WorkspaceHttpService implements WorkspaceApiPort {
  constructor(private readonly http: HttpClient) {}

  loadWorkspace(): Promise<WorkspaceSnapshot> {
    return firstValueFrom(this.http.get<WorkspaceSnapshot>(`${environment.apiBaseUrl}${API_ROUTES.workspace}`));
  }
}
