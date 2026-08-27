export interface CatalogModule {
  readonly id: string;
  readonly name: string;
  readonly category: 'Structure' | 'Facade' | 'Wet core' | 'Energy';
  readonly description: string;
  readonly industrializationPct: number;
  readonly repeatabilityPct: number;
  readonly imageUrl?: string;
}
