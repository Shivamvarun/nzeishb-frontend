import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { StoreService } from '../../core/state/store.service';
import { AppState } from '../../core/models/app.models';
import { ComparatorComponent } from '../solutions/comparator.component';

@Component({
    selector: 'app-solutions-workspace', templateUrl: './solutions-workspace.component.html', styleUrls: ['./solutions-workspace.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DecimalPipe, ComparatorComponent]
})
export class SolutionsWorkspaceComponent implements OnDestroy {
  state: AppState = this.store.getState();
  mode: 'tree' | 'compare' = 'tree';
  private readonly subscription: Subscription;

  constructor(private readonly store: StoreService) { this.subscription = this.store.state$.subscribe(state => this.state = state); }
  ngOnDestroy(): void { this.subscription.unsubscribe(); }
  selectVariant(id: string): void { this.store.setSelectedVariant(id); }
  openComparison(): void { this.mode = 'compare'; }
}
