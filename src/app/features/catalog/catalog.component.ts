import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { CATALOG_API, CatalogApiPort } from '../../core/api/catalog/catalog-api.port';
import { CatalogModule } from '../../core/api/catalog/catalog-api.models';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
    selector: 'app-catalog',
    templateUrl: './catalog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ButtonComponent]
})
export class CatalogComponent implements OnInit {
  modules: readonly CatalogModule[] = [];
  category: 'All' | CatalogModule['category'] = 'All';
  readonly categories: readonly ('All' | CatalogModule['category'])[] = ['All', 'Structure', 'Facade', 'Wet core', 'Energy'];
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
