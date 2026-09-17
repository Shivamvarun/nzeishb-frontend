import { Plot } from '../../spatial/models/spatial.models';
import { Scenario, VpoParams } from '../../scenario/models/scenario.models';
import { Variant } from '../../optimization/models/optimization.models';

export interface WorkspaceSnapshot {
  readonly plots: readonly Plot[];
  readonly activePlotId: string;
  readonly scenarios: readonly Scenario[];
  readonly activeScenarioId: string;
  readonly vpoParams: VpoParams;
  readonly variants: readonly Variant[];
}
