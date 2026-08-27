import { InjectionToken } from '@angular/core';
import { AuditEvent } from './audit-api.models';

export interface AuditApiPort {
  listEvents(entityType?: string, entityId?: string): Promise<readonly AuditEvent[]>;
}

export const AUDIT_API = new InjectionToken<AuditApiPort>('AUDIT_API');
