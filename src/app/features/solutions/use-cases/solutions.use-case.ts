import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PLACEHOLDER_VARIANT, Variant } from '../../optimization/models/optimization.models';

export interface SolutionsState {
  readonly selectedVariant: Variant;
  readonly comparedVariants: readonly [Variant, Variant];
}

@Injectable({ providedIn: 'root' })
export class SolutionsUseCase {
  private readonly subject = new BehaviorSubject<SolutionsState>({
    selectedVariant: PLACEHOLDER_VARIANT,
    comparedVariants: [PLACEHOLDER_VARIANT, PLACEHOLDER_VARIANT]
  });
  readonly state$ = this.subject.asObservable();

  getState(): SolutionsState {
    return this.subject.value;
  }

  hydrate(selectedVariant: Variant, comparedVariants: readonly [Variant, Variant]): void {
    this.subject.next({ selectedVariant, comparedVariants });
  }

  selectFromOptimize(first: Variant, second: Variant): void {
    this.subject.next({ selectedVariant: first, comparedVariants: [first, second] });
  }

  setSelectedVariant(id: string, variants: readonly Variant[]): void {
    const variant = variants.find(item => item.id === id);
    if (variant) this.subject.next({ ...this.getState(), selectedVariant: variant });
  }

  setComparedVariant(slot: 0 | 1, id: string, variants: readonly Variant[]): void {
    const variant = variants.find(item => item.id === id);
    if (!variant) return;
    const compared: [Variant, Variant] = [...this.getState().comparedVariants] as [Variant, Variant];
    compared[slot] = variant;
    if (compared[0].id === compared[1].id) {
      compared[slot === 0 ? 1 : 0] = variants.find(item => item.id !== id) ?? compared[slot];
    }
    this.subject.next({ ...this.getState(), comparedVariants: compared });
  }

  toggleComparedVariant(id: string, variants: readonly Variant[]): void {
    const variant = variants.find(item => item.id === id);
    if (!variant) return;
    const [first, second] = this.getState().comparedVariants;
    if (first.id === id || second.id === id) return;
    this.subject.next({ ...this.getState(), comparedVariants: [second, variant] });
  }
}
