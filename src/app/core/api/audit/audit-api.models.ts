export interface AuditEvent {
  readonly id: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly timestamp: string;
  readonly actor: string;
}
