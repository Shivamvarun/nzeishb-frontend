import { InjectionToken } from '@angular/core';
import { GeneratedArtifact } from '../models/artifact.models';

export interface ReportApiPort {
  generateBudget(solutionId: string): Promise<GeneratedArtifact>;
  generateReport(solutionId: string): Promise<GeneratedArtifact>;
}

export const REPORT_API = new InjectionToken<ReportApiPort>('REPORT_API');
