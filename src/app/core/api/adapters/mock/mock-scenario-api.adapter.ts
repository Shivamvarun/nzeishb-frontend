import { Injectable } from '@angular/core';
import { ScenarioApiPort } from '../../scenario/scenario-api.port';
import { Scenario } from '../../scenario/scenario-api.models';
import { mockScenarios } from './mock-inventory';

@Injectable()
export class MockScenarioApiAdapter implements ScenarioApiPort {
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
