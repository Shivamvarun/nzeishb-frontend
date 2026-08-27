import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { AppState, Variant } from '../../core/models/app.models';
import { StoreService } from '../../core/state/store.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: '../../components/dashboard/dashboard.component.html',
  styleUrls: ['../../components/dashboard/dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('dashboardChart') private chartRef!: ElementRef<HTMLCanvasElement>;
  state: AppState = this.store.getState();
  activeDrilldown = 'cost';
  private chart: Chart | undefined;
  private viewReady = false;
  private readonly subscription: Subscription;

  constructor(private readonly store: StoreService) {
    this.subscription = this.store.state$.subscribe(current => {
      this.state = current;
      if (this.viewReady) this.renderChart();
    });
  }

  get metrics(): { id: string; label: string; value: string; detail: string }[] {
    const v = this.state.selectedVariant;
    return [
      { id: 'cost', label: 'Cost per dwelling', value: `${v.costPerUnit.toLocaleString()} EUR`, detail: `${v.costPerM2.toLocaleString()} EUR/m2 including prefabrication assumptions.` },
      { id: 'energy', label: 'Primary energy', value: `${v.primaryEnergyDemandKwh} kWh/m2a`, detail: `${v.zebCompliancePct}% nZEB/ZEB compliance score.` },
      { id: 'water', label: 'Water demand', value: `${this.waterDemand(v).toLocaleString()} m3/yr`, detail: 'Mock KPI based on dwellings and compactness until backend KPI service is connected.' },
      { id: 'waste', label: 'Construction waste', value: `${this.waste(v)} t`, detail: 'Reduced by industrialization and repeatability factors.' },
      { id: 'carbon', label: 'Carbon footprint', value: `${v.carbonFootprintKgCo2} kgCO2e/m2`, detail: `Structure ${v.structureId}, facade ${v.facadeId}.` },
      { id: 'timeline', label: 'Estimated schedule', value: `${this.timeline(v)} weeks`, detail: 'Timeline estimate improves as industrialization increases.' }
    ];
  }

  ngAfterViewInit(): void { this.viewReady = true; this.renderChart(); }
  ngOnDestroy(): void { this.subscription.unsubscribe(); this.chart?.destroy(); }
  setDrilldown(id: string): void { this.activeDrilldown = id; this.renderChart(); }
  waterDemand(v: Variant): number { return Math.round(v.housingUnits * 86 * (1.08 - v.efficiencyRatio / 3)); }
  waste(v: Variant): number { return Number((v.builtAreaM2 * 0.018 * (1 - v.degreeIndustrialization * 0.45)).toFixed(1)); }
  timeline(v: Variant): number { return Math.round(64 - v.degreeIndustrialization * 18 - v.repeatabilityIndex * 8); }

  private renderChart(): void {
    if (!this.viewReady || !this.chartRef) return;
    const canvas = this.chartRef.nativeElement;
    if (this.chart) this.chart.destroy();
    const v = this.state.selectedVariant;
    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Cost/m2', 'Energy', 'Water', 'Waste', 'Carbon', 'Timeline'],
        datasets: [{
          label: v.name,
          data: [v.costPerM2 / 25, v.primaryEnergyDemandKwh, this.waterDemand(v) / 100, this.waste(v), v.carbonFootprintKgCo2 / 10, this.timeline(v)],
          backgroundColor: ['#38bdf8', '#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#a78bfa']
        }]
      },
      options: { responsive: false, animation: false, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }
}
