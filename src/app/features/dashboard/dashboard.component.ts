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
      { id: 'cost', label: 'Coste por vivienda', value: `${v.costPerUnit.toLocaleString()} €`, detail: `${v.costPerM2.toLocaleString()} €/m² incluyendo hipótesis de prefabricación.` },
      { id: 'energy', label: 'Energía primaria', value: `${v.primaryEnergyDemandKwh} kWh/m²a`, detail: `${v.zebCompliancePct}% de cumplimiento nZEB/ZEB.` },
      { id: 'water', label: 'Demanda de agua', value: `${this.waterDemand(v).toLocaleString()} m³/año`, detail: 'KPI estimado a partir de viviendas y compactidad hasta conectar el servicio backend.' },
      { id: 'waste', label: 'Residuos de obra', value: `${this.waste(v)} t`, detail: 'Reducido por industrialización y repetibilidad.' },
      { id: 'carbon', label: 'Huella de carbono', value: `${v.carbonFootprintKgCo2} kgCO₂e/m²`, detail: `Estructura ${v.structureId}, fachada ${v.facadeId}.` },
      { id: 'timeline', label: 'Plazo estimado', value: `${this.timeline(v)} semanas`, detail: 'El plazo mejora al aumentar la industrialización.' }
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
        labels: ['Coste/m²', 'Energía', 'Agua', 'Residuos', 'Carbono', 'Plazo'],
        datasets: [{
          label: v.name,
          data: [v.costPerM2 / 25, v.primaryEnergyDemandKwh, this.waterDemand(v) / 100, this.waste(v), v.carbonFootprintKgCo2 / 10, this.timeline(v)],
          backgroundColor: ['#2f6fed', '#2e9e5a', '#7b4db8', '#e39b00', '#c62828', '#e05aa8']
        }]
      },
      options: { responsive: false, animation: false, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#5c6b66' } }, y: { ticks: { color: '#5c6b66' } } } }
    });
  }
}
