import { Injectable } from '@angular/core';
import { BimApiPort } from '../../bim/bim-api.port';
import { GeneratedArtifact } from '../../bim/bim-api.models';

@Injectable()
export class MockBimApiAdapter implements BimApiPort {
  async generateIfc(solutionId: string): Promise<GeneratedArtifact> {
    await delay(350);
    return mockArtifact('ifc', solutionId, 'ifc');
  }
}

export function mockArtifact(kind: string, solutionId: string, extension: string): GeneratedArtifact {
  const fileName = `${kind}-${solutionId}.${extension}`;
  return { fileName, downloadUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(`Mock ${kind} artifact for ${solutionId}`)}` };
}

function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
