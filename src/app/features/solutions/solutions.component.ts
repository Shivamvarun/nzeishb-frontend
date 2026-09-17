import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { merge, Subscription } from 'rxjs';
import { OptimizationUseCase } from '../optimization/use-cases/optimization.use-case';
import { ComparatorComponent } from './components/comparator/comparator.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { SolutionsUseCase } from './use-cases/solutions.use-case';

@Component({
    selector: 'app-solutions', templateUrl: './solutions.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DecimalPipe, ComparatorComponent, ButtonComponent]
})
export class SolutionsComponent implements OnDestroy {
  state = this.compose();
  mode: 'tree' | 'compare' = 'tree';
  private readonly subscription: Subscription;

  constructor(
    private readonly optimization: OptimizationUseCase,
    private readonly solutions: SolutionsUseCase
  ) {
    this.subscription = merge(this.optimization.state$, this.solutions.state$).subscribe(() => {
      this.state = this.compose();
    });
  }

  ngOnDestroy(): void { this.subscription.unsubscribe(); }

  selectVariant(id: string): void {
    this.solutions.setSelectedVariant(id, this.optimization.getState().variants);
  }

  openComparison(): void { this.mode = 'compare'; }

  private compose() {
    return {
      ...this.optimization.getState(),
      ...this.solutions.getState()
    };
  }
}
