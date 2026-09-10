import { Injectable } from '@angular/core';
import { OptimizationApiPort } from '../../../api/optimization/optimization-api.port';
import { Variant, VpoParams } from '../../../api/optimization/optimization-api.models';
import { delay } from '../../../../shared/utils/delay';
import { mockParetoVariants } from './mock-inventory';

@Injectable()
export class MockOptimizationApiAdapter implements OptimizationApiPort {
  async optimize(_plotId: string, params: VpoParams): Promise<readonly Variant[]> {
    await delay(500);
    return mockParetoVariants.map((variant, index) => ({
      ...variant,
      housingUnits: Math.max(1, params.targetUnits + ((index % 3) - 1)),
      builtAreaM2: Math.min(params.buildableAreaM2, variant.builtAreaM2),
      stories: Math.min(params.maxHeightStories, variant.stories)
    }));
  }
}
