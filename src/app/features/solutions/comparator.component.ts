import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { AppState, Variant } from '../../core/models/app.models';
import { StoreService } from '../../core/state/store.service';

Chart.register(...registerables);

@Component({
  selector: 'app-comparator',
  templateUrl: '../../components/comparator/comparator.component.html',
  styleUrls: ['../../components/comparator/comparator.component.css']
})
export class ComparatorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('comparisonRadar') private radarRef!: ElementRef<HTMLCanvasElement>;
  state: AppState = this.store.getState();
  private radarChart: Chart | undefined;
  private viewReady = false;
  private readonly subscription: Subscription;

  constructor(private readonly store: StoreService) {
    this.subscription = this.store.state$.subscribe(current => {
      this.state = current;
      if (this.viewReady) this.renderRadar();
    });
  }

  get rows(): { label: string; unit: string; a: number; b: number; lowerWins: boolean }[] {
    const [a, b] = this.state.comparedVariants;
    return [
      { label: 'Coste por vivienda', unit: '€', a: a.costPerUnit, b: b.costPerUnit, lowerWins: true },
      { label: 'Coste por m²', unit: '€/m²', a: a.costPerM2, b: b.costPerM2, lowerWins: true },
      { label: 'Energía primaria', unit: 'kWh/m²a', a: a.primaryEnergyDemandKwh, b: b.primaryEnergyDemandKwh, lowerWins: true },
      { label: 'Huella de carbono', unit: 'kgCO₂e/m²', a: a.carbonFootprintKgCo2, b: b.carbonFootprintKgCo2, lowerWins: true },
      { label: 'Industrialización', unit: '%', a: a.degreeIndustrialization * 100, b: b.degreeIndustrialization * 100, lowerWins: false },
      { label: 'Repetibilidad', unit: '%', a: a.repeatabilityIndex * 100, b: b.repeatabilityIndex * 100, lowerWins: false },
      { label: 'Eficiencia espacial', unit: '%', a: a.efficiencyRatio * 100, b: b.efficiencyRatio * 100, lowerWins: false },
      { label: 'BREEAM', unit: 'pts', a: a.breeamScore, b: b.breeamScore, lowerWins: false },
      { label: 'VERDE', unit: 'pts', a: a.verdeScore, b: b.verdeScore, lowerWins: false }
    ];
  }

  ngAfterViewInit(): void { this.viewReady = true; this.renderRadar(); }
  ngOnDestroy(): void { this.subscription.unsubscribe(); this.radarChart?.destroy(); }
  setCompared(slot: 0 | 1, id: string): void { this.store.setComparedVariant(slot, id); }
  winner(row: { a: number; b: number; lowerWins: boolean }, side: 'a' | 'b'): boolean {
    if (row.a === row.b) return false;
    return side === 'a' ? (row.lowerWins ? row.a < row.b : row.a > row.b) : (row.lowerWins ? row.b < row.a : row.b > row.a);
  }
  format(value: number): string { return value.toLocaleString(undefined, { maximumFractionDigits: 1 }); }

  private renderRadar(): void {
    if (!this.viewReady || !this.radarRef) return;
    const canvas = this.radarRef.nativeElement;
    if (this.radarChart) this.radarChart.destroy();
    const [v1, v2] = this.state.comparedVariants;
    this.radarChart = new Chart(canvas, {
      type: 'radar',
      data: {
        labels: ['Coste', 'nZEB', 'Industrialización', 'BREEAM/VERDE', 'Eficiencia espacial'],
        datasets: [this.datasetFor(v1, '#2e9e5a'), this.datasetFor(v2, '#2f6fed')]
      },
      options: { responsive: false, animation: false, maintainAspectRatio: false, scales: { r: { min: 0, max: 100 } } }
    });
  }

  private datasetFor(variant: Variant, color: string) {
    return {
      label: variant.name,
      data: [
        Math.max(20, 100 - variant.costPerUnit / 2200),
        variant.zebCompliancePct,
        variant.degreeIndustrialization * 100,
        (variant.breeamScore + variant.verdeScore) / 2,
        variant.efficiencyRatio * 100
      ],
      backgroundColor: `${color}33`,
      borderColor: color
    };
  }
}
