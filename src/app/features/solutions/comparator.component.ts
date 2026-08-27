import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppState, Variant } from '../../core/models/app.models';
import { StoreService } from '../../core/state/store.service';

interface KpiRow {
  label: string;
  unit: string;
  a: number;
  b: number;
  lowerWins: boolean;
}

interface ProfileAxis {
  label: string;
  a: number;
  b: number;
}

@Component({
  selector: 'app-comparator',
  templateUrl: '../../components/comparator/comparator.component.html',
  styleUrls: ['../../components/comparator/comparator.component.css']
})
export class ComparatorComponent implements OnDestroy {
  state: AppState = this.store.getState();
  private readonly subscription: Subscription;

  // Fixed SVG geometry for the KPI profile. This intentionally avoids a
  // canvas/chart lifecycle so the comparison view remains deterministic and
  // renders correctly even when Angular switches into Compare dynamically.
  readonly profileCenter = { x: 210, y: 154 };
  readonly profileRadius = 104;
  readonly profileAngles = [-90, -18, 54, 126, 198];

  constructor(private readonly store: StoreService) {
    this.subscription = this.store.state$.subscribe(current => {
      this.state = current;
    });
  }

  get rows(): KpiRow[] {
    const [a, b] = this.state.comparedVariants;
    return [
      { label: 'Cost per dwelling', unit: 'EUR', a: a.costPerUnit, b: b.costPerUnit, lowerWins: true },
      { label: 'Cost per m2', unit: 'EUR/m2', a: a.costPerM2, b: b.costPerM2, lowerWins: true },
      { label: 'Primary energy', unit: 'kWh/m2a', a: a.primaryEnergyDemandKwh, b: b.primaryEnergyDemandKwh, lowerWins: true },
      { label: 'Carbon footprint', unit: 'kgCO2e/m2', a: a.carbonFootprintKgCo2, b: b.carbonFootprintKgCo2, lowerWins: true },
      { label: 'Industrialization', unit: '%', a: a.degreeIndustrialization * 100, b: b.degreeIndustrialization * 100, lowerWins: false },
      { label: 'Repeatability', unit: '%', a: a.repeatabilityIndex * 100, b: b.repeatabilityIndex * 100, lowerWins: false },
      { label: 'Spatial efficiency', unit: '%', a: a.efficiencyRatio * 100, b: b.efficiencyRatio * 100, lowerWins: false },
      { label: 'BREEAM', unit: 'pts', a: a.breeamScore, b: b.breeamScore, lowerWins: false },
      { label: 'VERDE', unit: 'pts', a: a.verdeScore, b: b.verdeScore, lowerWins: false }
    ];
  }

  get profileAxes(): ProfileAxis[] {
    const [a, b] = this.state.comparedVariants;
    return [
      { label: 'Cost', a: this.normalized(a.costPerUnit, b.costPerUnit, true, a.costPerUnit), b: this.normalized(b.costPerUnit, a.costPerUnit, true, b.costPerUnit) },
      { label: 'nZEB', a: this.clamp(a.zebCompliancePct), b: this.clamp(b.zebCompliancePct) },
      { label: 'Industrialization', a: this.clamp(a.degreeIndustrialization * 100), b: this.clamp(b.degreeIndustrialization * 100) },
      { label: 'BREEAM / VERDE', a: this.averageScore(a), b: this.averageScore(b) },
      { label: 'Spatial efficiency', a: this.clamp(a.efficiencyRatio * 100), b: this.clamp(b.efficiencyRatio * 100) }
    ];
  }

  get profilePolygonA(): string {
    return this.profileAxes.map((axis, i) => this.profilePoint(axis.a, i)).join(' ');
  }

  get profilePolygonB(): string {
    return this.profileAxes.map((axis, i) => this.profilePoint(axis.b, i)).join(' ');
  }

  get profileGrid(): string[] {
    return [20, 40, 60, 80, 100].map(level => this.profileAxes
      .map((_, i) => this.profilePoint(level, i))
      .join(' '));
  }

  get profileAxisLines(): { x1: number; y1: number; x2: number; y2: number }[] {
    return this.profileAngles.map(angle => {
      const point = this.polarPoint(this.profileRadius, angle);
      return { x1: this.profileCenter.x, y1: this.profileCenter.y, x2: point.x, y2: point.y };
    });
  }

  get profileLabels(): { label: string; x: number; y: number; anchor: 'start' | 'middle' | 'end' }[] {
    return this.profileAxes.map((axis, i) => {
      const angle = this.profileAngles[i];
      const point = this.polarPoint(this.profileRadius + 30, angle);
      const cos = Math.cos(angle * Math.PI / 180);
      const anchor: 'start' | 'middle' | 'end' = cos > 0.35 ? 'start' : cos < -0.35 ? 'end' : 'middle';
      return { label: axis.label, x: point.x, y: point.y, anchor };
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  setCompared(slot: 0 | 1, id: string): void {
    this.store.setComparedVariant(slot, id);
  }

  winner(row: KpiRow, side: 'a' | 'b'): boolean {
    if (row.a === row.b) return false;
    return side === 'a'
      ? (row.lowerWins ? row.a < row.b : row.a > row.b)
      : (row.lowerWins ? row.b < row.a : row.b > row.a);
  }

  format(value: number): string {
    return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  }

  private averageScore(variant: Variant): number {
    return this.clamp((variant.breeamScore + variant.verdeScore) / 2);
  }

  private normalized(value: number, other: number, lowerWins: boolean, fallback: number): number {
    const denominator = Math.max(value, other, fallback, 1);
    if (lowerWins) {
      // Lower is better: the best of the two candidates is always 100.
      const best = Math.min(value, other);
      return this.clamp(value === best ? 100 : (best / denominator) * 100);
    }
    return this.clamp((value / denominator) * 100);
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  }

  private polarPoint(radius: number, angle: number): { x: number; y: number } {
    const radians = angle * Math.PI / 180;
    return {
      x: this.profileCenter.x + radius * Math.cos(radians),
      y: this.profileCenter.y + radius * Math.sin(radians)
    };
  }

  private profilePoint(value: number, index: number): string {
    const point = this.polarPoint(this.profileRadius * (this.clamp(value) / 100), this.profileAngles[index]);
    return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
  }
}
