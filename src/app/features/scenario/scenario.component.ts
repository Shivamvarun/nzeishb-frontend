import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { merge } from 'rxjs';
import { Plot } from '../spatial/models/spatial.models';
import { SpatialUseCase } from '../spatial/use-cases/spatial.use-case';
import { VpoFormComponent } from './components/vpo-form/vpo-form.component';
import { Scenario, VpoParams } from './models/scenario.models';
import { ScenarioUseCase } from './use-cases/scenario.use-case';

@Component({
    selector: 'app-scenario',
    templateUrl: './scenario.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DecimalPipe, VpoFormComponent]
})
export class ScenarioComponent {
  state: { activeScenario: Scenario; vpoParams: VpoParams; activePlot: Plot } = this.compose();

  constructor(
    private readonly scenario: ScenarioUseCase,
    private readonly spatial: SpatialUseCase
  ) {
    merge(this.scenario.state$, this.spatial.state$).subscribe(() => {
      this.state = this.compose();
    });
  }

  private compose() {
    return {
      activeScenario: this.scenario.getState().activeScenario,
      vpoParams: this.scenario.getState().vpoParams,
      activePlot: this.spatial.getState().activePlot
    };
  }
}
