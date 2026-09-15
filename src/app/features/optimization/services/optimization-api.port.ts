import { InjectionToken } from '@angular/core';
import { VpoParams } from '../../scenario/models/scenario.models';
import { Variant } from '../models/optimization.models';

export interface OptimizationApiPort {
  optimize(plotId: string, params: VpoParams): Promise<readonly Variant[]>;
}

export const OPTIMIZATION_API = new InjectionToken<OptimizationApiPort>('OPTIMIZATION_API');
