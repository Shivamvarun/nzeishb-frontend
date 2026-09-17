export interface GeoJsonPolygon {
  readonly type: 'Polygon';
  readonly coordinates: number[][][];
}

export interface Plot {
  readonly id: string;
  readonly name: string;
  readonly municipality: string;
  readonly municipalityCode: string;
  readonly cadastralRef: string;
  readonly graphicAreaM2: number;
  readonly buildableAreaMaxM2: number;
  readonly maxHeightStories: number;
  readonly maxUnits: number;
  readonly climateZone: string;
  readonly coordinates: readonly [number, number];
  readonly geojson: GeoJsonPolygon;
  readonly pgouZone: string;
  readonly decreeLaw1_2025Applied: boolean;
}

export const PLACEHOLDER_PLOT: Plot = {
  id: 'loading-plot',
  name: 'Loading plot',
  municipality: '',
  municipalityCode: '',
  cadastralRef: '',
  graphicAreaM2: 0,
  buildableAreaMaxM2: 0,
  maxHeightStories: 0,
  maxUnits: 0,
  climateZone: '',
  coordinates: [0, 0],
  geojson: { type: 'Polygon', coordinates: [] },
  pgouZone: '',
  decreeLaw1_2025Applied: false
};

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
