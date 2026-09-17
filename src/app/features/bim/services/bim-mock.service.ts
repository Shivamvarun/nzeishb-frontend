import { Injectable } from '@angular/core';
import { mockArtifact } from '../../../core/constants/app.constants';
import { delay } from '../../../shared/utils/delay';
import { GeneratedArtifact } from '../../reports/models/artifact.models';
import { BimApiPort } from './bim-api.port';

@Injectable()
export class BimMockService implements BimApiPort {
  async generateIfc(solutionId: string): Promise<GeneratedArtifact> {
    await delay(350);
    return mockArtifact('ifc', solutionId, 'ifc');
  }
}
