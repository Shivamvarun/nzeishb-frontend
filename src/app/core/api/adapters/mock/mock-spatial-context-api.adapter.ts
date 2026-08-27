import { Injectable } from '@angular/core';
import { SpatialContextApiPort } from '../../spatial/spatial-context-api.port';
import { SpatialContextSnapshot } from '../../spatial/spatial-context-api.models';

@Injectable()
export class MockSpatialContextApiAdapter implements SpatialContextApiPort {
  async getContext(plotId: string, scenarioId: string): Promise<SpatialContextSnapshot> {
    await new Promise(resolve => setTimeout(resolve, 180));
    return {
      contextId: `CTX-MOCK-${plotId}`,
      version: 1,
      scenarioId,
      plotId,
      crs: 'EPSG:4326 (viewer) · metric CRS pending PM decision',
      municipalityCode: '14021',
      planning: { setbacksM: 5, maxHeightM: 20, buildableAreaM2: 4165 },
      hardConstraints: [
        { type: 'heritage-buffer', value: 0, unit: 'm', source: 'Mock spatial evidence' },
        { type: 'protected-area-penalty', value: 0, unit: 'penalty', source: 'Mock spatial evidence' }
      ],
      provenance: [
        { source: 'Spatial PoC seed', serviceVersion: 'mock-1.0', queriedAt: new Date().toISOString() },
        { source: 'Normative planning handoff', serviceVersion: 'mock-1.0', queriedAt: new Date().toISOString() }
      ],
      isMock: true
    };
  }
}
