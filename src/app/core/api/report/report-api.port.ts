import { InjectionToken } from '@angular/core';
import { GeneratedArtifact } from './report-api.models';

export interface ReportApiPort {
  generateReport(solutionId: string): Promise<GeneratedArtifact>;
}

export const REPORT_API = new InjectionToken<ReportApiPort>('REPORT_API');
