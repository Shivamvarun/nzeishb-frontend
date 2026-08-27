import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AuditApiPort } from '../../audit/audit-api.port';
import { API_ROUTES } from '../../api-routes';
import { AuditEvent } from '../../audit/audit-api.models';

@Injectable()
export class HttpAuditApiAdapter implements AuditApiPort {
  constructor(private readonly http: HttpClient) {}
  listEvents(entityType?: string, entityId?: string): Promise<readonly AuditEvent[]> {
    const params: Record<string, string> = {};
    if (entityType) params['entityType'] = entityType;
    if (entityId) params['entityId'] = entityId;
    return firstValueFrom(this.http.get<readonly AuditEvent[]>(`${environment.apiBaseUrl}${API_ROUTES.audit}`, { params }));
  }
}
