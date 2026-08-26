import { LegalCitation, Plot, Scenario, Variant } from '../../../models/app.models';

export const mockParcels: readonly Plot[] = [{
  id: 'PLOT-CORDOBA-01', name: 'Parcela Parqueflores (Córdoba - Referencia PoC)', municipality: 'Córdoba', municipalityCode: '14021',
  cadastralRef: '4392010UG4449N0001AZ', graphicAreaM2: 2450, buildableAreaMaxM2: 4165, maxHeightStories: 5, maxUnits: 48,
  climateZone: 'B4', coordinates: [37.8882, -4.7795], geojson: { type: 'Polygon', coordinates: [[[-4.7802, 37.8888], [-4.7788, 37.8888], [-4.7788, 37.8876], [-4.7802, 37.8876], [-4.7802, 37.8888]]]},
  pgouZone: 'Zona Residencial Plurifamiliar R-3', decreeLaw1_2025Applied: true
}];

export const mockParetoVariants: readonly Variant[] = [
  { id: 'VAR-01', name: 'Variante A: Optimizada en Coste (Económica)', tag: 'Coste óptimo', tagClass: 'tag-cost', costPerUnit: 72400, costPerM2: 980, primaryEnergyDemandKwh: 24.5, zebCompliancePct: 92, degreeIndustrialization: .88, repeatabilityIndex: .92, carbonFootprintKgCo2: 245, builtAreaM2: 3820, usableAreaM2: 3120, efficiencyRatio: .817, housingUnits: 44, stories: 4, facadeId: 'FAC-SATE-01', wetCoreId: 'WET-3D-MODULAR', structureId: 'STR-CONCRETE-PRECAST', hvacCentralized: true, breeamScore: 78, verdeScore: 82 },
  { id: 'VAR-02', name: 'Variante B: Optimizada en Eficiencia Energética (nZEB Premium)', tag: 'Energía óptima', tagClass: 'tag-energy', costPerUnit: 81200, costPerM2: 1120, primaryEnergyDemandKwh: 12.8, zebCompliancePct: 100, degreeIndustrialization: .84, repeatabilityIndex: .85, carbonFootprintKgCo2: 195, builtAreaM2: 3950, usableAreaM2: 3210, efficiencyRatio: .812, housingUnits: 42, stories: 5, facadeId: 'FAC-WOOD-03', wetCoreId: 'WET-3D-MODULAR', structureId: 'STR-STEEL-LIGHT', hvacCentralized: true, breeamScore: 94, verdeScore: 95 }
];

export const mockLegalCitations: readonly LegalCitation[] = [{
  document: 'Orden de 12 de febrero de 2020', provision: 'Artículo 6 - Programa y Dimensiones Mínimas', text: 'Las viviendas de un dormitorio tendrán una superficie útil mínima de 40 m² y máxima de 60 m².'
}];

export const mockScenarios: Scenario[] = [{
  id: 'SCENARIO-2026-001', name: 'Proyecto Parqueflores R-3 (Fase I)', status: 'criteria_set',
  created: '2026-08-10', updated: '2026-08-10', plotId: mockParcels[0].id
}];
