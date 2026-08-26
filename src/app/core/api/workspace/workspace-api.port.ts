import { InjectionToken } from '@angular/core';
import { WorkspaceSnapshot } from './workspace-api.models';

export interface WorkspaceApiPort {
  loadWorkspace(): Promise<WorkspaceSnapshot>;
}

export const WORKSPACE_API = new InjectionToken<WorkspaceApiPort>('WORKSPACE_API');
