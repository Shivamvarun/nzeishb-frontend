import { InjectionToken } from '@angular/core';
import { Variant, VpoParams } from './optimization-api.models';

export interface OptimizationApiPort {
  optimize(plotId: string, params: VpoParams): Promise<readonly Variant[]>;
}

export const OPTIMIZATION_API = new InjectionToken<OptimizationApiPort>('OPTIMIZATION_API');
