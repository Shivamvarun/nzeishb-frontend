import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { StoreService } from '../../core/state/store.service';
import { AppState, Variant } from '../../core/models/app.models';

Chart.register(...registerables);

@Component({
  selector: 'app-pareto-explorer',
  templateUrl: '../../components/pareto-explorer/pareto-explorer.component.html',
  styleUrls: ['../../components/pareto-explorer/pareto-explorer.component.css']
})
export class ParetoExplorerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('paretoChart') private chartRef!: ElementRef<HTMLCanvasElement>;
  state: AppState = this.store.getState();
  maxCost = 190000;
  maxEnergy = 50;
  minIndustrialization = 0;
  visibleLimit = 8;
  rotation = 20;
  private chart: Chart | undefined;
  private viewReady = false;
  private readonly subscription: Subscription;

  constructor(private readonly store: StoreService) {
    this.subscription = this.store.state$.subscribe(current => {
      this.state = current;
      if (this.viewReady) this.renderChart();
    });
  }

  get filteredVariants(): readonly Variant[] {
    return this.state.variants
      .filter(v => v.costPerUnit <= this.maxCost && v.primaryEnergyDemandKwh <= this.maxEnergy && v.degreeIndustrialization >= this.minIndustrialization / 100)
      .slice(0, this.visibleLimit);
  }

  ngAfterViewInit(): void { this.viewReady = true; this.renderChart(); }
  ngOnDestroy(): void { this.subscription.unsubscribe(); this.chart?.destroy(); }
  selectVariant(id: string): void { this.store.setSelectedVariant(id); }
  compareVariant(id: string, event: Event): void { event.stopPropagation(); this.store.toggleComparedVariant(id); }
  loadMore(): void { this.visibleLimit = Math.min(this.visibleLimit + 4, this.state.variants.length); this.renderChart(); }
  isCompared(id: string): boolean { return this.state.comparedVariants.some(item => item.id === id); }

  renderChart(): void {
    if (!this.viewReady || !this.chartRef) return;
    const canvas = this.chartRef.nativeElement;
    const variants = this.filteredVariants;
    const angle = this.rotation * Math.PI / 180;
    if (this.chart) this.chart.destroy();

    this.chart = new Chart(canvas, {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'Pareto variants',
          data: variants.map(v => ({
            x: (v.costPerUnit / 1000) + Math.cos(angle) * v.degreeIndustrialization * 18,
            y: v.primaryEnergyDemandKwh - Math.sin(angle) * v.repeatabilityIndex * 12,
            r: 8 + v.degreeIndustrialization * 13,
            variant: v
          })),
          backgroundColor: variants.map(v => this.isCompared(v.id) ? 'rgba(47, 111, 237, 0.72)' : 'rgba(46, 158, 90, 0.6)'),
          borderColor: variants.map(v => this.state.selectedVariant.id === v.id ? '#e39b00' : '#1b7a4a'),
          borderWidth: 2
        }]
      },
      options: {
        responsive: false,
        animation: false,
        maintainAspectRatio: false,
        onClick: (_event, elements) => {
          const index = elements[0]?.index;
          if (index !== undefined) this.selectVariant(variants[index].id);
        },
        scales: {
          x: { title: { display: true, text: 'Coste por vivienda + proyección (k€)', color: '#5c6b66' }, ticks: { color: '#5c6b66' } },
          y: { title: { display: true, text: 'Energía primaria + repetibilidad', color: '#5c6b66' }, ticks: { color: '#5c6b66' } }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: ctx => {
                const raw = ctx.raw as { variant: Variant };
                return `${raw.variant.name}: ${raw.variant.costPerUnit.toLocaleString()} EUR | ${raw.variant.primaryEnergyDemandKwh} kWh/m2a | ${(raw.variant.degreeIndustrialization * 100).toFixed(0)}% industrialized`;
              }
            }
          }
        }
      }
    });
  }
}
