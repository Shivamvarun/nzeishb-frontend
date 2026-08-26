import { Injectable } from '@angular/core';
import { AuditApiPort } from '../../audit/audit-api.port';
import { GeneratedArtifact } from '../../audit/audit-api.models';
import { mockArtifact } from './mock-bim-api.adapter';

@Injectable()
export class MockAuditApiAdapter implements AuditApiPort {
  async generateBudget(solutionId: string): Promise<GeneratedArtifact> {
    await delay(350);
    return mockArtifact('budget', solutionId, 'pdf');
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
