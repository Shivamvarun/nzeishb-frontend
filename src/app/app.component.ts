import { Component } from '@angular/core';
import { ActiveView } from './core/models/app.models';
import { StoreService } from './core/state/store.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  readonly state$ = this.store.state$;
  readonly views: { id: ActiveView; icon: string; label: string }[] = [
    { id: 'gis', icon: 'fa-map-location-dot', label: 'Mapa' },
    { id: 'bim', icon: 'fa-cube', label: 'BIM' },
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Análisis' },
    { id: 'pareto', icon: 'fa-chart-line', label: 'Optimización' },
    { id: 'comparator', icon: 'fa-table-columns', label: 'Comparador' },
    { id: 'reports', icon: 'fa-file-export', label: 'Informes' }
  ];

  constructor(private readonly store: StoreService) {}

  setView(view: ActiveView): void {
    this.store.setActiveView(view);
  }

  saveScenario(): void {
    void this.store.saveScenario();
  }

  workflowStep(view: ActiveView | undefined): 1 | 2 | 3 {
    if (view === 'gis') return 1;
    if (view === 'bim') return 2;
    return 3;
  }
}
