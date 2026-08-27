import { Injectable } from '@angular/core';
import { ReportApiPort } from '../../report/report-api.port';
import { GeneratedArtifact } from '../../../models/app.models';
import { mockArtifact } from './mock-bim-api.adapter';

@Injectable()
export class MockReportApiAdapter implements ReportApiPort {
  async generateBudget(solutionId: string): Promise<GeneratedArtifact> { await delay(350); return mockArtifact('budget', solutionId, 'pdf'); }
  async generateReport(solutionId: string): Promise<GeneratedArtifact> { await delay(350); return mockArtifact('report', solutionId, 'pdf'); }
}
function delay(milliseconds: number): Promise<void> { return new Promise(resolve => setTimeout(resolve, milliseconds)); }
