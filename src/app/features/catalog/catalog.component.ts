import { Component, OnInit } from '@angular/core';
import { CATALOG_API, CatalogApiPort } from '../../core/api/catalog/catalog-api.port';
import { CatalogModule } from '../../core/api/catalog/catalog-api.models';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
  modules: readonly CatalogModule[] = [];
  category: 'All' | CatalogModule['category'] = 'All';
  selected: CatalogModule | null = null;
  loading = true;
  error = '';

  constructor(@Inject(CATALOG_API) private readonly catalogApi: CatalogApiPort) {}

  async ngOnInit(): Promise<void> {
    try {
      this.modules = await this.catalogApi.listModules();
      this.selected = this.modules[0] ?? null;
    } catch {
      this.error = 'The industrialised catalogue is temporarily unavailable.';
    } finally {
      this.loading = false;
    }
  }

  get filteredModules(): readonly CatalogModule[] {
    return this.category === 'All' ? this.modules : this.modules.filter(item => item.category === this.category);
  }

  select(module: CatalogModule): void { this.selected = module; }
}
