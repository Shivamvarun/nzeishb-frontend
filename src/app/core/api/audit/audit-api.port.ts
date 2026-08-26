import { InjectionToken } from '@angular/core';
import { GeneratedArtifact } from './audit-api.models';

export interface AuditApiPort {
  generateBudget(solutionId: string): Promise<GeneratedArtifact>;
}

export const AUDIT_API = new InjectionToken<AuditApiPort>('AUDIT_API');
