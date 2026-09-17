import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { merge } from 'rxjs';
import { OptimizationUseCase } from '../../../optimization/use-cases/optimization.use-case';
import { Plot } from '../../../spatial/models/spatial.models';
import { SpatialUseCase } from '../../../spatial/use-cases/spatial.use-case';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { Scenario, VpoParams } from '../../models/scenario.models';
import { ScenarioUseCase } from '../../use-cases/scenario.use-case';

@Component({
    selector: 'app-vpo-form',
    templateUrl: './vpo-form.component.html',
    styleUrl: './vpo-form.component.css',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DecimalPipe, ButtonComponent]
})
export class VpoFormComponent {
  readonly scenarioOpenClass =
    'min-w-0 flex-col items-stretch justify-start !gap-0 border-0 bg-transparent p-[3px] text-left text-xs font-normal leading-normal text-ink';
  readonly scenarioDeleteClass =
    'whitespace-nowrap border-danger-border bg-surface px-2 py-1.5 text-[11px] font-bold text-danger hover:bg-danger-bg';

  state: {
    activeScenario: Scenario;
    scenarioHistory: readonly Scenario[];
    vpoParams: VpoParams;
    activePlot: Plot;
    isOptimizing: boolean;
  } = this.compose();

  constructor(
    private readonly scenario: ScenarioUseCase,
    private readonly spatial: SpatialUseCase,
    private readonly optimization: OptimizationUseCase
  ) {
    merge(this.scenario.state$, this.spatial.state$, this.optimization.state$).subscribe(() => {
      this.state = this.compose();
    });
  }

  update(key: keyof VpoParams, value: number): void {
    this.scenario.updateVPOParams({ [key]: value });
  }

  optimize(): void {
    void this.optimization.optimize();
  }

  createScenario(): void {
    void this.scenario.createScenario();
  }

  reopenScenario(id: string): void {
    this.scenario.reopenScenario(id);
  }

  deleteScenario(id: string): void {
    void this.scenario.deleteScenario(id);
  }

  private compose() {
    return {
      ...this.scenario.getState(),
      activePlot: this.spatial.getState().activePlot,
      isOptimizing: this.optimization.getState().isOptimizing
    };
  }
}
