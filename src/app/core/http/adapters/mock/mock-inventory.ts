import { LegalCitation, Plot, Scenario, Variant } from '../../../models/app.models';

export const mockParcels: readonly Plot[] = [{
  id: 'PLOT-CORDOBA-01', name: 'Parcela Parqueflores (Córdoba - Referencia PoC)', municipality: 'Córdoba', municipalityCode: '14021',
  cadastralRef: '4392010UG4449N0001AZ', graphicAreaM2: 2450, buildableAreaMaxM2: 4165, maxHeightStories: 5, maxUnits: 48,
  climateZone: 'B4', coordinates: [37.8882, -4.7795], geojson: { type: 'Polygon', coordinates: [[[-4.7802, 37.8888], [-4.7788, 37.8888], [-4.7788, 37.8876], [-4.7802, 37.8876], [-4.7802, 37.8888]]]},
  pgouZone: 'Zona Residencial Plurifamiliar R-3', decreeLaw1_2025Applied: true
}];

export const mockParetoVariants: readonly Variant[] = [
  { id: 'VAR-01', name: 'Variant A · Cost focused', tag: 'Cost optimum', tagClass: 'tag-cost', costPerUnit: 68000, costPerM2: 930, primaryEnergyDemandKwh: 38, zebCompliancePct: 86, degreeIndustrialization: .94, repeatabilityIndex: .96, carbonFootprintKgCo2: 250, builtAreaM2: 3780, usableAreaM2: 3120, efficiencyRatio: .826, housingUnits: 44, stories: 4, facadeId: 'FAC-SATE-01', wetCoreId: 'WET-3D-MODULAR', structureId: 'STR-CONCRETE-PRECAST', hvacCentralized: true, breeamScore: 76, verdeScore: 80 },
  { id: 'VAR-02', name: 'Variant B · Energy focused', tag: 'Energy optimum', tagClass: 'tag-energy', costPerUnit: 84000, costPerM2: 1150, primaryEnergyDemandKwh: 13, zebCompliancePct: 100, degreeIndustrialization: .86, repeatabilityIndex: .88, carbonFootprintKgCo2: 185, builtAreaM2: 3950, usableAreaM2: 3220, efficiencyRatio: .815, housingUnits: 42, stories: 5, facadeId: 'FAC-WOOD-03', wetCoreId: 'WET-3D-MODULAR', structureId: 'STR-STEEL-LIGHT', hvacCentralized: true, breeamScore: 95, verdeScore: 96 },
  { id: 'VAR-03', name: 'Variant C · Balanced', tag: 'Balanced', tagClass: 'tag-indus', costPerUnit: 75000, costPerM2: 1010, primaryEnergyDemandKwh: 24, zebCompliancePct: 94, degreeIndustrialization: .92, repeatabilityIndex: .94, carbonFootprintKgCo2: 215, builtAreaM2: 3820, usableAreaM2: 3160, efficiencyRatio: .827, housingUnits: 44, stories: 4, facadeId: 'FAC-SATE-01', wetCoreId: 'WET-3D-MODULAR', structureId: 'STR-CONCRETE-PRECAST', hvacCentralized: true, breeamScore: 84, verdeScore: 87 },
  { id: 'VAR-04', name: 'Variant D · Low carbon', tag: 'Low carbon', tagClass: 'tag-energy', costPerUnit: 79000, costPerM2: 1080, primaryEnergyDemandKwh: 20, zebCompliancePct: 97, degreeIndustrialization: .88, repeatabilityIndex: .91, carbonFootprintKgCo2: 160, builtAreaM2: 3880, usableAreaM2: 3190, efficiencyRatio: .822, housingUnits: 43, stories: 5, facadeId: 'FAC-WOOD-03', wetCoreId: 'WET-3D-MODULAR', structureId: 'STR-STEEL-LIGHT', hvacCentralized: true, breeamScore: 91, verdeScore: 93 },
  { id: 'VAR-05', name: 'Variant E · Maximum repeatability', tag: 'Industrial optimum', tagClass: 'tag-indus', costPerUnit: 73000, costPerM2: 970, primaryEnergyDemandKwh: 31, zebCompliancePct: 90, degreeIndustrialization: .98, repeatabilityIndex: .99, carbonFootprintKgCo2: 235, builtAreaM2: 3800, usableAreaM2: 3140, efficiencyRatio: .826, housingUnits: 44, stories: 4, facadeId: 'FAC-SATE-01', wetCoreId: 'WET-3D-MODULAR', structureId: 'STR-CONCRETE-PRECAST', hvacCentralized: true, breeamScore: 81, verdeScore: 84 },
  { id: 'VAR-06', name: 'Variant F · Premium ZEB', tag: 'Premium ZEB', tagClass: 'tag-energy', costPerUnit: 92000, costPerM2: 1240, primaryEnergyDemandKwh: 10, zebCompliancePct: 100, degreeIndustrialization: .80, repeatabilityIndex: .82, carbonFootprintKgCo2: 150, builtAreaM2: 4000, usableAreaM2: 3230, efficiencyRatio: .807, housingUnits: 40, stories: 5, facadeId: 'FAC-WOOD-03', wetCoreId: 'WET-3D-MODULAR', structureId: 'STR-STEEL-LIGHT', hvacCentralized: true, breeamScore: 98, verdeScore: 98 },
  { id: 'VAR-07', name: 'Variant G · Compact', tag: 'Compact', tagClass: 'tag-cost', costPerUnit: 71000, costPerM2: 950, primaryEnergyDemandKwh: 28, zebCompliancePct: 91, degreeIndustrialization: .90, repeatabilityIndex: .93, carbonFootprintKgCo2: 220, builtAreaM2: 3650, usableAreaM2: 3070, efficiencyRatio: .841, housingUnits: 45, stories: 4, facadeId: 'FAC-SATE-01', wetCoreId: 'WET-3D-MODULAR', structureId: 'STR-CONCRETE-PRECAST', hvacCentralized: true, breeamScore: 79, verdeScore: 83 },
  { id: 'VAR-08', name: 'Variant H · Low embodied carbon', tag: 'Carbon focused', tagClass: 'tag-energy', costPerUnit: 81000, costPerM2: 1090, primaryEnergyDemandKwh: 18, zebCompliancePct: 98, degreeIndustrialization: .84, repeatabilityIndex: .87, carbonFootprintKgCo2: 135, builtAreaM2: 3920, usableAreaM2: 3200, efficiencyRatio: .816, housingUnits: 42, stories: 5, facadeId: 'FAC-WOOD-03', wetCoreId: 'WET-3D-MODULAR', structureId: 'STR-STEEL-LIGHT', hvacCentralized: true, breeamScore: 93, verdeScore: 95 }
];

export const mockLegalCitations: readonly LegalCitation[] = [{
  document: 'Orden de 12 de febrero de 2020', provision: 'Artículo 6 - Programa y Dimensiones Mínimas', text: 'Las viviendas de un dormitorio tendrán una superficie útil mínima de 40 m² y máxima de 60 m².'
}];

export const mockScenarios: Scenario[] = [{
  id: 'SCENARIO-2026-001', name: 'Proyecto Parqueflores R-3 (Fase I)', status: 'criteria_set',
  created: '2026-08-10', updated: '2026-08-10', plotId: mockParcels[0].id
}];
