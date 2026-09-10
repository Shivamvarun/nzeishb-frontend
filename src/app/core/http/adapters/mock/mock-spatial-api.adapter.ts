import { Injectable } from '@angular/core';
import { SpatialApiPort } from '../../../api/spatial/spatial-api.port';
import { Plot } from '../../../api/spatial/spatial-api.models';
import { mockParcels } from './mock-inventory';

@Injectable()
export class MockSpatialApiAdapter implements SpatialApiPort {
  async listPlots(): Promise<readonly Plot[]> {
    return [...mockParcels];
  }

  async findPlotByCadastralRef(reference: string): Promise<Plot | null> {
    return mockParcels.find(plot => plot.cadastralRef.toUpperCase() === reference.toUpperCase()) ?? null;
  }
}
