import { Injectable } from '@angular/core';
import { OptimizationApiPort } from '../../optimization/optimization-api.port';
import { Variant, VpoParams } from '../../optimization/optimization-api.models';
import { mockParetoVariants } from './mock-inventory';

@Injectable()
export class MockOptimizationApiAdapter implements OptimizationApiPort {
  async optimize(_plotId: string, params: VpoParams): Promise<readonly Variant[]> {
    await delay(500);
    return mockParetoVariants.map((variant, index) => ({
      ...variant,
      housingUnits: index === 0 ? params.targetUnits : Math.max(1, params.targetUnits - 2)
    }));
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
