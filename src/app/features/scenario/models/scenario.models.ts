export interface VpoParams {
  readonly maxHeightStories: number;
  readonly buildableAreaM2: number;
  readonly targetUnits: number;
}

export interface Scenario {
  readonly id: string;
  readonly name: string;
  readonly status: 'criteria_set' | 'optimizing' | 'ready';
  readonly created: string;
  readonly plotId?: string;
  readonly updated?: string;
}

export const PLACEHOLDER_SCENARIO: Scenario = {
  id: 'loading-scenario',
  name: 'Loading scenario',
  status: 'criteria_set',
  created: '',
  updated: '',
  plotId: 'loading-plot'
};

export const DEFAULT_VPO_PARAMS: VpoParams = {
  maxHeightStories: 5,
  buildableAreaM2: 4165,
  targetUnits: 44
};
