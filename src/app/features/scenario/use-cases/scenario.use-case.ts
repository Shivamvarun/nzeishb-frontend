import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ShellService } from '../../../core/shared/services/shell.service';
import { SpatialUseCase } from '../../spatial/use-cases/spatial.use-case';
import { DEFAULT_VPO_PARAMS, PLACEHOLDER_SCENARIO, Scenario, VpoParams } from '../models/scenario.models';
import { SCENARIO_API, ScenarioApiPort } from '../services/scenario-api.port';

export interface ScenarioState {
  readonly activeScenario: Scenario;
  readonly scenarioHistory: readonly Scenario[];
  readonly vpoParams: VpoParams;
  readonly isSaving: boolean;
}

@Injectable({ providedIn: 'root' })
export class ScenarioUseCase {
  private readonly subject = new BehaviorSubject<ScenarioState>({
    activeScenario: PLACEHOLDER_SCENARIO,
    scenarioHistory: [PLACEHOLDER_SCENARIO],
    vpoParams: DEFAULT_VPO_PARAMS,
    isSaving: false
  });
  readonly state$ = this.subject.asObservable();

  constructor(
    @Inject(SCENARIO_API) private readonly scenarioApi: ScenarioApiPort,
    private readonly spatial: SpatialUseCase,
    private readonly shell: ShellService
  ) {}

  getState(): ScenarioState {
    return this.subject.value;
  }

  hydrate(scenarios: readonly Scenario[], activeScenario: Scenario, vpoParams: VpoParams): void {
    this.patch({ scenarioHistory: scenarios, activeScenario, vpoParams });
  }

  selectScenario(scenarioId: string): void {
    const scenario = this.getState().scenarioHistory.find(item => item.id === scenarioId);
    if (!scenario) return;
    this.patch({ activeScenario: scenario });
  }

  reopenScenario(id: string): void {
    this.selectScenario(id);
  }

  updateVPOParams(params: Partial<VpoParams>): void {
    this.patch({ vpoParams: { ...this.getState().vpoParams, ...params } });
  }

  async saveScenario(): Promise<void> {
    this.patch({ isSaving: true });
    this.shell.setError(null);
    try {
      const saved = await this.scenarioApi.saveScenario(
        this.getState().activeScenario,
        this.getState().vpoParams,
        this.spatial.getState().activePlot.id
      );
      const scenario = {
        ...saved,
        updated: new Date().toISOString(),
        plotId: this.spatial.getState().activePlot.id
      };
      this.patch({ activeScenario: scenario, scenarioHistory: this.upsertScenario(scenario) });
    } catch {
      this.shell.setError('No se pudo guardar el escenario.');
    } finally {
      this.patch({ isSaving: false });
    }
  }

  async createScenario(): Promise<void> {
    try {
      const scenario = await this.scenarioApi.createScenario(
        this.spatial.getState().activePlot.id,
        this.getState().vpoParams
      );
      this.patch({ activeScenario: scenario, scenarioHistory: this.upsertScenario(scenario) });
      this.shell.setError(null);
    } catch {
      this.shell.setError('No se pudo crear el escenario.');
    }
  }

  async deleteScenario(id: string): Promise<void> {
    try {
      await this.scenarioApi.deleteScenario(id);
      const nextHistory = this.getState().scenarioHistory.filter(item => item.id !== id);
      const activeScenario = this.getState().activeScenario.id === id
        ? (nextHistory[0] ?? this.getState().activeScenario)
        : this.getState().activeScenario;
      this.patch({ scenarioHistory: nextHistory, activeScenario });
      this.shell.setError(null);
    } catch {
      this.shell.setError('No se pudo eliminar el escenario.');
    }
  }

  private patch(change: Partial<ScenarioState>): void {
    this.subject.next({ ...this.getState(), ...change });
  }

  private upsertScenario(scenario: Scenario): readonly Scenario[] {
    return [scenario, ...this.getState().scenarioHistory.filter(item => item.id !== scenario.id)];
  }
}
