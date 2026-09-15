import { Injectable } from '@angular/core';
import { mockParetoVariants } from '../../../core/constants/app.constants';
import { delay } from '../../../shared/utils/delay';
import { VpoParams } from '../../scenario/models/scenario.models';
import { Variant } from '../models/optimization.models';
import { OptimizationApiPort } from './optimization-api.port';

@Injectable()
export class OptimizationMockService implements OptimizationApiPort {
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
