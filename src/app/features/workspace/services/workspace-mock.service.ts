import { Injectable } from '@angular/core';
import { mockParcels, mockParetoVariants, mockScenarios } from '../../../core/constants/app.constants';
import { WorkspaceSnapshot } from '../models/workspace.models';
import { WorkspaceApiPort } from './workspace-api.port';

@Injectable()
export class WorkspaceMockService implements WorkspaceApiPort {
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
