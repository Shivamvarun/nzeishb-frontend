import { InjectionToken } from '@angular/core';
import { Plot } from './spatial-api.models';

export interface SpatialApiPort {
  listPlots(): Promise<readonly Plot[]>;
  findPlotByCadastralRef(reference: string): Promise<Plot | null>;
}

export const SPATIAL_API = new InjectionToken<SpatialApiPort>('SPATIAL_API');
