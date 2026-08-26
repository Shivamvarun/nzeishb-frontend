import { Injectable } from '@angular/core';
import { WorkspaceApiPort } from '../../workspace/workspace-api.port';
import { WorkspaceSnapshot } from '../../workspace/workspace-api.models';
import { mockParcels, mockParetoVariants, mockScenarios } from './mock-inventory';

@Injectable()
export class MockWorkspaceApiAdapter implements WorkspaceApiPort {
  async loadWorkspace(): Promise<WorkspaceSnapshot> {
    const activeScenario = mockScenarios[0];
    return {
      plots: [...mockParcels],
      activePlotId: mockParcels[0].id,
      scenarios: [...mockScenarios],
      activeScenarioId: activeScenario.id,
      vpoParams: { maxHeightStories: 5, buildableAreaM2: 4165, targetUnits: 44 },
      variants: [...mockParetoVariants]
    };
  }
}
