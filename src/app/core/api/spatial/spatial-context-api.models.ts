export interface SpatialContextSnapshot {
  readonly contextId: string;
  readonly version: number;
  readonly scenarioId: string;
  readonly plotId: string;
  readonly crs: string;
  readonly municipalityCode: string;
  readonly planning: { readonly setbacksM: number; readonly maxHeightM: number; readonly buildableAreaM2: number };
  readonly hardConstraints: readonly { readonly type: string; readonly value: number; readonly unit: string; readonly source: string }[];
  readonly provenance: readonly { readonly source: string; readonly serviceVersion: string; readonly queriedAt: string }[];
  readonly isMock: boolean;
}
