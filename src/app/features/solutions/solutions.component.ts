import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { StoreService } from '../../core/services/store.service';
import { AppState } from '../../core/models/app.models';
import { ComparatorComponent } from './components/comparator/comparator.component';

@Component({
    selector: 'app-solutions', templateUrl: './solutions.component.html', styleUrls: ['./solutions.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DecimalPipe, ComparatorComponent]
})
export class SolutionsComponent implements OnDestroy {
  state: AppState = this.store.getState();
  mode: 'tree' | 'compare' = 'tree';
  private readonly subscription: Subscription;

  constructor(private readonly store: StoreService) { this.subscription = this.store.state$.subscribe(state => this.state = state); }
  ngOnDestroy(): void { this.subscription.unsubscribe(); }
  selectVariant(id: string): void { this.store.setSelectedVariant(id); }
  openComparison(): void { this.mode = 'compare'; }
}
