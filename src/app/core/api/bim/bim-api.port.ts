import { InjectionToken } from '@angular/core';
import { GeneratedArtifact } from './bim-api.models';

export interface BimApiPort {
  generateIfc(solutionId: string): Promise<GeneratedArtifact>;
}

export const BIM_API = new InjectionToken<BimApiPort>('BIM_API');
