import { Injectable } from '@angular/core';
import { CatalogApiPort } from '../../catalog/catalog-api.port';
import { CatalogModule } from '../../catalog/catalog-api.models';

const modules: readonly CatalogModule[] = [
  { id: 'MOD-STR-01', name: 'Precast structural frame', category: 'Structure', description: 'Repeatable precast frame sized for industrialised residential production.', industrializationPct: 94, repeatabilityPct: 96 },
  { id: 'MOD-FAC-02', name: 'High-performance facade cassette', category: 'Facade', description: 'Factory-finished facade cassette with low thermal transmittance.', industrializationPct: 91, repeatabilityPct: 93 },
  { id: 'MOD-WET-03', name: '3D wet-core module', category: 'Wet core', description: 'Bathroom and service core assembled off-site and connected on site.', industrializationPct: 97, repeatabilityPct: 98 },
  { id: 'MOD-ENE-04', name: 'PV + heat-pump package', category: 'Energy', description: 'Standardised renewable-energy package for nZEB-oriented variants.', industrializationPct: 88, repeatabilityPct: 90 },
  { id: 'MOD-FAC-05', name: 'Timber-aluminium hybrid facade', category: 'Facade', description: 'Alternative facade family for lower embodied carbon.', industrializationPct: 84, repeatabilityPct: 87 },
  { id: 'MOD-STR-06', name: 'Light steel modular frame', category: 'Structure', description: 'Lightweight modular structural option for rapid assembly.', industrializationPct: 90, repeatabilityPct: 94 }
];

@Injectable()
export class MockCatalogApiAdapter implements CatalogApiPort {
  async listModules(): Promise<readonly CatalogModule[]> {
    return modules;
  }
}
