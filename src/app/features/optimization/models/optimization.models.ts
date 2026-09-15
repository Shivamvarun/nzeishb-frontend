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

export const PLACEHOLDER_VARIANT: Variant = {
  id: 'loading-variant',
  name: 'Loading variant',
  tag: '',
  tagClass: '',
  costPerUnit: 0,
  costPerM2: 0,
  primaryEnergyDemandKwh: 0,
  zebCompliancePct: 0,
  degreeIndustrialization: 0,
  repeatabilityIndex: 0,
  carbonFootprintKgCo2: 0,
  builtAreaM2: 0,
  usableAreaM2: 0,
  efficiencyRatio: 0,
  housingUnits: 0,
  stories: 0,
  facadeId: '',
  wetCoreId: '',
  structureId: '',
  hvacCentralized: false,
  breeamScore: 0,
  verdeScore: 0
};
