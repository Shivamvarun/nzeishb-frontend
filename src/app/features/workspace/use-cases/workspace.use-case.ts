import { Inject, Injectable } from '@angular/core';
import { ShellService } from '../../../core/shared/services/shell.service';
import { OptimizationUseCase } from '../../optimization/use-cases/optimization.use-case';
import { ScenarioUseCase } from '../../scenario/use-cases/scenario.use-case';
import { SolutionsUseCase } from '../../solutions/use-cases/solutions.use-case';
import { SpatialUseCase } from '../../spatial/use-cases/spatial.use-case';
import { WORKSPACE_API, WorkspaceApiPort } from '../services/workspace-api.port';

@Injectable({ providedIn: 'root' })
export class WorkspaceUseCase {
  constructor(
    @Inject(WORKSPACE_API) private readonly workspaceApi: WorkspaceApiPort,
    private readonly spatial: SpatialUseCase,
    private readonly scenario: ScenarioUseCase,
    private readonly optimization: OptimizationUseCase,
    private readonly solutions: SolutionsUseCase,
    private readonly shell: ShellService
  ) {
    void this.loadWorkspace();
  }

  private async loadWorkspace(): Promise<void> {
    try {
      const workspace = await this.workspaceApi.loadWorkspace();
      const activePlot = workspace.plots.find(item => item.id === workspace.activePlotId) ?? workspace.plots[0];
      const activeScenario = workspace.scenarios.find(item => item.id === workspace.activeScenarioId) ?? workspace.scenarios[0];
      const selectedVariant = workspace.variants[0];
      const comparedSecond = workspace.variants[1] ?? selectedVariant;
      if (!activePlot || !activeScenario || !selectedVariant) throw new Error('Incomplete workspace');
      this.spatial.hydrate(workspace.plots, activePlot);
      this.scenario.hydrate(workspace.scenarios, activeScenario, workspace.vpoParams);
      this.optimization.hydrate(workspace.variants);
      this.solutions.hydrate(selectedVariant, [selectedVariant, comparedSecond]);
      this.shell.setError(null);
    } catch {
      this.shell.setError('No se pudo cargar el espacio de trabajo.');
    }
  }
}
