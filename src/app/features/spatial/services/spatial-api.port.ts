import { InjectionToken } from '@angular/core';
import { Plot, SpatialContextSnapshot } from '../models/spatial.models';

export interface SpatialApiPort {
  listPlots(): Promise<readonly Plot[]>;
  findPlotByCadastralRef(reference: string): Promise<Plot | null>;
  getContext(plotId: string, scenarioId: string): Promise<SpatialContextSnapshot>;
}

export const SPATIAL_API = new InjectionToken<SpatialApiPort>('SPATIAL_API');
