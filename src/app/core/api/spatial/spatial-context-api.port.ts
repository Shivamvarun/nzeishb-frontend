import { InjectionToken } from '@angular/core';
import { SpatialContextSnapshot } from './spatial-context-api.models';

export interface SpatialContextApiPort {
  getContext(plotId: string, scenarioId: string): Promise<SpatialContextSnapshot>;
}

export const SPATIAL_CONTEXT_API = new InjectionToken<SpatialContextApiPort>('SPATIAL_CONTEXT_API');
