import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoreService } from '../../core/state/store.service';
import { AppState } from '../../core/models/app.models';

@Component({ selector: 'app-solutions-workspace', templateUrl: './solutions-workspace.component.html', styleUrls: ['./solutions-workspace.component.css'] })
export class SolutionsWorkspaceComponent implements OnDestroy {
  state: AppState = this.store.getState();
  mode: 'tree' | 'compare' = 'tree';
  private readonly subscription: Subscription;

  constructor(private readonly store: StoreService) { this.subscription = this.store.state$.subscribe(state => this.state = state); }
  ngOnDestroy(): void { this.subscription.unsubscribe(); }
  selectVariant(id: string): void { this.store.setSelectedVariant(id); }
  openComparison(): void { this.mode = 'compare'; }
}
