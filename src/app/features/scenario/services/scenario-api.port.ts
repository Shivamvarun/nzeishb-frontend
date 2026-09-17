import { InjectionToken } from '@angular/core';
import { Scenario, VpoParams } from '../models/scenario.models';

export interface ScenarioApiPort {
  saveScenario(scenario: Scenario, params: VpoParams, plotId: string): Promise<Scenario>;
  createScenario(plotId: string, params: VpoParams): Promise<Scenario>;
  deleteScenario(scenarioId: string): Promise<void>;
}

export const SCENARIO_API = new InjectionToken<ScenarioApiPort>('SCENARIO_API');
