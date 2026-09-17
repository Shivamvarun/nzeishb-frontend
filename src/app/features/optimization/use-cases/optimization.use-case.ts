import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ShellService } from '../../../core/shared/services/shell.service';
import { ScenarioUseCase } from '../../scenario/use-cases/scenario.use-case';
import { SolutionsUseCase } from '../../solutions/use-cases/solutions.use-case';
import { SpatialUseCase } from '../../spatial/use-cases/spatial.use-case';
import { Variant } from '../models/optimization.models';
import { OPTIMIZATION_API, OptimizationApiPort } from '../services/optimization-api.port';

export interface OptimizationState {
  readonly variants: readonly Variant[];
  readonly isOptimizing: boolean;
}

@Injectable({ providedIn: 'root' })
export class OptimizationUseCase {
  private readonly subject = new BehaviorSubject<OptimizationState>({
    variants: [],
    isOptimizing: false
  });
  readonly state$ = this.subject.asObservable();

  constructor(
    @Inject(OPTIMIZATION_API) private readonly optimizationApi: OptimizationApiPort,
    private readonly spatial: SpatialUseCase,
    private readonly scenario: ScenarioUseCase,
    private readonly solutions: SolutionsUseCase,
    private readonly shell: ShellService
  ) {}

  getState(): OptimizationState {
    return this.subject.value;
  }

  hydrate(variants: readonly Variant[]): void {
    this.patch({ variants });
  }

  async optimize(): Promise<void> {
    this.patch({ isOptimizing: true });
    this.shell.setError(null);
    try {
      const variants = await this.optimizationApi.optimize(
        this.spatial.getState().activePlot.id,
        this.scenario.getState().vpoParams
      );
      if (variants.length >= 2) {
        this.patch({ variants });
        this.solutions.selectFromOptimize(variants[0], variants[1]);
      }
    } catch {
      this.shell.setError('No se pudo ejecutar la optimizacion.');
    } finally {
      this.patch({ isOptimizing: false });
    }
  }

  private patch(change: Partial<OptimizationState>): void {
    this.subject.next({ ...this.getState(), ...change });
  }
}
