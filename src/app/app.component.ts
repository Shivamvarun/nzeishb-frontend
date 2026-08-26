import { Component } from '@angular/core';
import { ActiveView } from './core/models/app.models';
import { StoreService } from './core/state/store.service';
@Component({ selector: 'app-root', templateUrl: './app.component.html', styleUrls: ['./app.component.css'] })
export class AppComponent { readonly state$ = this.store.state$; constructor(private readonly store: StoreService) {} setView(view: ActiveView): void { this.store.setActiveView(view); } saveScenario(): void { void this.store.saveScenario(); } }
