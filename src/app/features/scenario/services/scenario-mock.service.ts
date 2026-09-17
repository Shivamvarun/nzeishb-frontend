import { Injectable } from '@angular/core';
import { mockScenarios } from '../../../core/constants/app.constants';
import { Scenario } from '../models/scenario.models';
import { ScenarioApiPort } from './scenario-api.port';

@Injectable()
export class ScenarioMockService implements ScenarioApiPort {
  async saveScenario(scenario: Scenario): Promise<Scenario> {
    const saved = { ...scenario, status: 'criteria_set' as const, updated: new Date().toISOString() };
    const next = [saved, ...mockScenarios.filter(item => item.id !== saved.id)];
    mockScenarios.splice(0, mockScenarios.length, ...next);
    return saved;
  }

  async createScenario(plotId: string): Promise<Scenario> {
    const created = new Date().toISOString();
    const scenario: Scenario = {
      id: `SCENARIO-${Date.now()}`,
      name: `Nuevo escenario ${mockScenarios.length + 1}`,
      status: 'criteria_set',
      created,
      updated: created,
      plotId
    };
    mockScenarios.unshift(scenario);
    return scenario;
  }

  async deleteScenario(scenarioId: string): Promise<void> {
    const next = mockScenarios.filter(item => item.id !== scenarioId);
    mockScenarios.splice(0, mockScenarios.length, ...next);
  }
}
