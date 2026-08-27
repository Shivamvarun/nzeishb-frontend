import { Injectable } from '@angular/core';
import { AuditApiPort } from '../../audit/audit-api.port';
import { AuditEvent } from '../../audit/audit-api.models';

@Injectable()
export class MockAuditApiAdapter implements AuditApiPort {
  private readonly events: AuditEvent[] = [];
  async listEvents(entityType?: string, entityId?: string): Promise<readonly AuditEvent[]> {
    return this.events.filter(event => (!entityType || event.entityType === entityType) && (!entityId || event.entityId === entityId));
  }
}
