import { Injectable } from '@angular/core';
import { mockArtifact } from '../../../core/constants/app.constants';
import { delay } from '../../../shared/utils/delay';
import { GeneratedArtifact } from '../models/artifact.models';
import { ReportApiPort } from './report-api.port';

@Injectable()
export class ReportMockService implements ReportApiPort {
  async generateBudget(solutionId: string): Promise<GeneratedArtifact> {
    await delay(350);
    return mockArtifact('budget', solutionId, 'pdf');
  }
  async generateReport(solutionId: string): Promise<GeneratedArtifact> {
    await delay(350);
    return mockArtifact('report', solutionId, 'pdf');
  }
}
