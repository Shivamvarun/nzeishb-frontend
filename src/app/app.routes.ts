import { inject } from '@angular/core';
import { CanActivateFn, Routes } from '@angular/router';
import { ActiveView } from './core/models/app.models';
import { StoreService } from './core/services/store.service';
import { CatalogComponent } from './features/catalog/catalog.component';
import { ReportsComponent } from './features/reports/reports.component';
import { ScenarioComponent } from './features/scenario/scenario.component';
import { SolutionsComponent } from './features/solutions/solutions.component';
import { SpatialLayoutComponent } from './layout/spatial-layout.component';

const syncActiveView = (view: ActiveView): CanActivateFn => () => {
  inject(StoreService).setActiveView(view);
  return true;
};

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [syncActiveView('spatial')],
    component: SpatialLayoutComponent
  },
  {
    path: 'catalog',
    canActivate: [syncActiveView('catalog')],
    component: CatalogComponent
  },
  {
    path: 'scenario',
    canActivate: [syncActiveView('scenario')],
    component: ScenarioComponent
  },
  {
    path: 'optimization',
    canActivate: [syncActiveView('optimization')],
    loadComponent: () => import('./features/optimization/optimization.component').then(m => m.OptimizationComponent)
  },
  {
    path: 'bim',
    canActivate: [syncActiveView('bim')],
    loadComponent: () => import('./features/bim/bim.component').then(m => m.BimComponent)
  },
  {
    path: 'solutions',
    canActivate: [syncActiveView('solutions')],
    component: SolutionsComponent
  },
  {
    path: 'reports',
    canActivate: [syncActiveView('reports')],
    component: ReportsComponent
  },
  { path: '**', redirectTo: '' }
];
