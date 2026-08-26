/** Shared frontend domain contracts; kept framework-independent for BFF contract reuse. */
export type ActiveView = 'gis' | 'bim' | 'dashboard' | 'pareto' | 'comparator' | 'reports';

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

export interface Variant {
  readonly id: string;
  readonly name: string;
  readonly tag: string;
  readonly tagClass: string;
  readonly costPerUnit: number;
  readonly costPerM2: number;
  readonly primaryEnergyDemandKwh: number;
  readonly zebCompliancePct: number;
  readonly degreeIndustrialization: number;
  readonly repeatabilityIndex: number;
  readonly carbonFootprintKgCo2: number;
  readonly builtAreaM2: number;
  readonly usableAreaM2: number;
  readonly efficiencyRatio: number;
  readonly housingUnits: number;
  readonly stories: number;
  readonly facadeId: string;
  readonly wetCoreId: string;
  readonly structureId: string;
  readonly hvacCentralized: boolean;
  readonly breeamScore: number;
  readonly verdeScore: number;
}

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

/** Data required to initialise the application shell, supplied by the configured API adapter. */
export interface WorkspaceSnapshot {
  readonly plots: readonly Plot[];
  readonly activePlotId: string;
  readonly scenarios: readonly Scenario[];
  readonly activeScenarioId: string;
  readonly vpoParams: VpoParams;
  readonly variants: readonly Variant[];
}

export interface LegalCitation { readonly document: string; readonly provision: string; readonly text: string; }
export interface ChatReply { readonly text: string; readonly citations: readonly LegalCitation[]; }
export interface GeneratedArtifact { readonly fileName: string; readonly downloadUrl: string; }
export type ArtifactKind = 'ifc' | 'budget' | 'report';
export interface ArtifactRecord {
  readonly id: string;
  readonly kind: ArtifactKind;
  readonly fileName: string;
  readonly variantId: string;
  readonly status: 'queued' | 'generating' | 'ready' | 'failed';
  readonly created: string;
  readonly downloadUrl?: string;
  readonly preview?: string;
}

export interface AppState {
  readonly activePlot: Plot;
  readonly plots: readonly Plot[];
  readonly activeScenario: Scenario;
  readonly scenarioHistory: readonly Scenario[];
  readonly vpoParams: VpoParams;
  readonly variants: readonly Variant[];
  readonly selectedVariant: Variant;
  readonly comparedVariants: readonly [Variant, Variant];
  readonly artifactHistory: readonly ArtifactRecord[];
  readonly activeView: ActiveView;
  readonly isOptimizing: boolean;
  readonly isSaving: boolean;
  readonly error: string | null;
  readonly chatMessages: readonly ChatMessage[];
}

export interface ChatMessage { readonly sender: 'bot' | 'user'; readonly text: string; readonly citations: readonly LegalCitation[]; readonly timestamp: string; }
