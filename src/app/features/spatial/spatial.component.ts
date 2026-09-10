import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { StoreService } from '../../core/services/store.service';
import { GeoJsonPolygon, Plot } from '../../core/models/app.models';
import { SPATIAL_CONTEXT_API, SpatialContextApiPort } from '../../core/api/spatial/spatial-context-api.port';
import { SpatialContextSnapshot } from '../../core/api/spatial/spatial-context-api.models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-spatial',
  templateUrl: './spatial.component.html',
  styleUrls: ['./spatial.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DecimalPipe, FormsModule]
})
export class SpatialComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) private mapContainerRef!: ElementRef<HTMLDivElement>;
  inventoryPlots = this.store.getPlots();
  activePlot = this.store.getState().activePlot;
  selectedPlotId = this.inventoryPlots.length ? this.inventoryPlots[0].id : '';
  cadastralRef = '';
  importError = '';
  showPlanningDialog = false;
  selectedTypology = 'U-shaped';
  readonly typologies = ['Linear', 'Corner', 'U-shaped', 'Closed block'];
  readonly layerGroups = [
    {
      name: 'Land / cadastre', hint: 'Parcel identity and land-bank information', layers: [
        { id: 'vpo', name: 'VPO-eligible parcels', source: 'Spatial', swatch: '#087021', available: true },
        { id: 'cadastre', name: 'Cadastral parcels', source: 'Catastro', swatch: '#6b1fa5', available: true }
      ]
    },
    {
      name: 'Urban system', hint: 'Population, blocks, buildings and green areas', layers: [
        { id: 'populations', name: 'Populations', source: 'DERA 07', swatch: '#94a3b8', available: false },
        { id: 'blocks', name: 'Urban blocks', source: 'DERA 07', swatch: '#64748b', available: false },
        { id: 'buildings', name: 'Buildings', source: 'DERA 07', swatch: '#a1a1aa', available: false },
        { id: 'green', name: 'Green areas', source: 'DERA 07', swatch: '#7ab678', available: false }
      ]
    },
    {
      name: 'Heritage', hint: 'Protected cultural assets and perimeters', layers: [
        { id: 'heritage', name: 'BIC / UNESCO protection', source: 'CGPHA', swatch: '#b45309', available: false }
      ]
    },
    {
      name: 'Mobility', hint: 'Transport, stations and cycle infrastructure', layers: [
        { id: 'mobility', name: 'Transport and communications', source: 'DERA 09', swatch: '#0284c7', available: false },
        { id: 'cycle', name: 'Cycle lanes', source: 'IDEAndalucía', swatch: '#0ea5e9', available: false }
      ]
    },
    {
      name: 'Services', hint: 'Amenities used for proximity evidence', layers: [
        { id: 'services', name: 'Services and amenities', source: 'DERA 12', swatch: '#14b8a6', available: false }
      ]
    },
    {
      name: 'Nature', hint: 'Natura 2000, protected nature and vegetation', layers: [
        { id: 'nature', name: 'Natura 2000 / protected areas', source: 'MITECO / Andalucía', swatch: '#16a34a', available: false },
        { id: 'ndvi', name: 'Vegetation / NDVI', source: 'Spatial', swatch: '#65a30d', available: false }
      ]
    },
    {
      name: 'Climate hazards', hint: 'Climate exposure and hazard information', layers: [
        { id: 'hazards', name: 'Climate hazards', source: 'Spatial / AdapteCCa', swatch: '#f59e0b', available: false }
      ]
    },
    {
      name: 'Climate change', hint: 'Time-indexed climate-change scenarios', layers: [
        { id: 'climate-change', name: 'AdapteCCa climate-change grid', source: 'AdapteCCa', swatch: '#dc2626', available: false }
      ]
    }
  ];
  showParcel = true;
  showEnvelope = true;
  showCadLayer = false;
  showLayerDrawer = false;
  private readonly collapsedLayerGroups = new Set<string>([
    'Land / cadastre',
    'Urban system',
    'Heritage',
    'Mobility',
    'Services',
    'Nature',
    'Climate hazards',
    'Climate change'
  ]);
  drawingMode = false;
  buildingCardCollapsed = false;
  rotationMode = false;
  mapMode: '2d' | '3d' = '2d';
  readonly iconPaths = {
    twoD: 'assets/arva-icons/2d.png',
    rotation: 'assets/arva-icons/3d_rotation.png',
    collapse: 'assets/arva-icons/collapse_content.png',
    expand: 'assets/arva-icons/expand_content.png',
    delete: 'assets/arva-icons/delete.png',
    edit: 'assets/arva-icons/edit_square.png'
  };
  drawingPoints: L.LatLng[] = [];
  spatialContext: SpatialContextSnapshot | null = null;
  contextLoading = false;
  get mockFloors(): number[] { return Array.from({ length: Math.max(3, Math.min(6, this.store.getState().vpoParams.maxHeightStories || 4)) }, (_, i) => i); }

  private map: L.Map | undefined;
  private parcelLayer: L.Layer | undefined;
  private envelopeLayer: L.Layer | undefined;
  private cadLayer: L.Layer | undefined;
  private drawingLayer: L.Polyline | undefined;
  private subscription: Subscription | undefined;
  private resizeObserver: ResizeObserver | undefined;

  constructor(public readonly store: StoreService, @Inject(SPATIAL_CONTEXT_API) private readonly spatialContextApi: SpatialContextApiPort) { }

  ngAfterViewInit(): void {
    this.subscription = this.store.state$.subscribe(current => {
      this.inventoryPlots = current.plots;
      this.activePlot = current.activePlot;
      this.selectedPlotId = current.activePlot.id;
      if (!this.isRenderablePlot(current.activePlot)) return;
      if (!this.map) this.initializeMap(current.activePlot);
      else this.renderPlot(current.activePlot);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.resizeObserver?.disconnect();
    this.map?.remove();
    this.map = undefined;
  }

  get occupation(): number { return Math.round(this.activePlot.graphicAreaM2 * 0.82); }

  toggleLayerGroup(name: string): void {
    if (this.collapsedLayerGroups.has(name)) this.collapsedLayerGroups.delete(name);
    else this.collapsedLayerGroups.add(name);
  }

  isLayerGroupCollapsed(name: string): boolean { return this.collapsedLayerGroups.has(name); }

  activeLayerCount(group: { layers: readonly { id: string }[] }): number {
    return group.layers.filter(layer => this.isLayerVisible(layer.id)).length;
  }

  isLayerVisible(id: string): boolean {
    if (id === 'vpo') return this.showEnvelope;
    if (id === 'cadastre') return this.showParcel;
    return false;
  }

  setLayerVisible(id: string, visible: boolean): void {
    if (id === 'vpo') this.showEnvelope = visible;
    if (id === 'cadastre') this.showParcel = visible;
    this.renderPlot(this.activePlot);
  }

  zoomIn(): void { this.map?.zoomIn(); }

  zoomOut(): void { this.map?.zoomOut(); }

  setMapMode(mode: '2d' | '3d'): void {
    this.mapMode = mode;
    if (mode === '2d') this.rotationMode = false;
    this.invalidateMapSize();
  }

  toggleRotationMode(): void {
    this.rotationMode = !this.rotationMode;
  }

  async toggleFullscreen(): Promise<void> {
    const element = this.mapContainerRef.nativeElement.parentElement;
    if (!element) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (element.requestFullscreen) {
      await element.requestFullscreen();
      this.invalidateMapSize();
    }
  }

  acceptPlanning(): void {
    this.showPlanningDialog = false;
    this.store.setActiveView('optimization');
  }


  async loadSpatialContext(): Promise<void> {
    if (this.contextLoading) return;
    this.contextLoading = true;
    try {
      this.spatialContext = await this.spatialContextApi.getContext(this.activePlot.id, this.store.getState().activeScenario.id);
    } catch {
      this.importError = 'SpatialContext gateway route is not available yet.';
    } finally {
      this.contextLoading = false;
    }
  }

  selectPlot(plotId: string): void {
    const selected = this.store.getPlotById(plotId);
    if (selected) {
      this.store.setActivePlot(selected);
      this.cadastralRef = selected.cadastralRef || '';
      this.importError = '';
    }
  }

  async searchByCadastralRef(): Promise<void> {
    const reference = this.cadastralRef.trim();
    if (!reference) {
      this.importError = 'Enter a valid cadastral reference.';
      return;
    }
    try {
      const found = await this.store.findAndSelectPlot(reference);
      this.importError = found ? '' : 'No parcel found with that reference.';
    } catch {
      this.importError = 'Cadastral search is temporarily unavailable.';
    }
  }

  onGeoJsonSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const geometry = this.extractGeoJsonGeometry(JSON.parse(reader.result as string));
        if (!geometry || geometry.type !== 'Polygon' || !geometry.coordinates?.length) throw new Error('Invalid geometry');
        this.addImportedGeometry(file.name, geometry);
      } catch {
        this.importError = 'Could not import the file. A simple Polygon GeoJSON is expected.';
      }
    };
    reader.readAsText(file);
  }

  onCadSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.importError = `${file.name} is attached as a CAD/DXF overlay placeholder. Backend CAD parsing can replace this with real geometry.`;
    this.showCadLayer = true;
    this.renderPlot(this.activePlot);
  }

  toggleDrawing(): void {
    if (this.drawingMode && this.drawingPoints.length >= 3) {
      const ring = [...this.drawingPoints, this.drawingPoints[0]].map(point => [point.lng, point.lat]);
      this.addImportedGeometry('Manual parcel', { type: 'Polygon', coordinates: [ring] });
      this.clearDrawing();
    }
    this.drawingMode = !this.drawingMode;
  }

  clearDrawing(): void {
    this.drawingPoints = [];
    if (this.drawingLayer && this.map) this.map.removeLayer(this.drawingLayer);
    this.drawingLayer = undefined;
  }

  private onMapClick(latlng: L.LatLng): void {
    if (this.drawingMode) {
      this.drawingPoints = [...this.drawingPoints, latlng];
      if (this.drawingLayer && this.map) this.map.removeLayer(this.drawingLayer);
      this.drawingLayer = L.polyline(this.drawingPoints, { color: '#facc15', weight: 3 }).addTo(this.map!);
      return;
    }
    if (!this.parcelLayer) return;
    const latlngs = ((this.parcelLayer as L.Polygon).getLatLngs() as L.LatLng[][])[0];
    if (this.isPointInPolygon(latlng, latlngs)) this.store.setActivePlot(this.activePlot);
  }

  private addImportedGeometry(name: string, geometry: GeoJsonPolygon): void {
    const plot: Plot = {
      id: `IMPORTED-${Date.now()}`,
      name,
      cadastralRef: 'IMPORTED',
      coordinates: [geometry.coordinates[0][0][1], geometry.coordinates[0][0][0]],
      geojson: geometry,
      municipality: 'Imported',
      municipalityCode: '',
      graphicAreaM2: 0,
      buildableAreaMaxM2: 0,
      maxHeightStories: 0,
      maxUnits: 0,
      climateZone: '',
      pgouZone: 'Imported',
      decreeLaw1_2025Applied: false
    };
    this.store.addPlot(plot);
    this.importError = '';
  }

  private extractGeoJsonGeometry(json: unknown): GeoJsonPolygon | null {
    const item = json as { type?: string; features?: { geometry?: GeoJsonPolygon }[]; geometry?: GeoJsonPolygon; coordinates?: number[][][] };
    if (item.type === 'FeatureCollection' && item.features?.length) return item.features[0].geometry ?? null;
    if (item.type === 'Feature' && item.geometry) return item.geometry;
    if (item.type === 'Polygon') return item as GeoJsonPolygon;
    return null;
  }

  private isPointInPolygon(point: L.LatLng, polygon: L.LatLng[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat, yi = polygon[i].lng;
      const xj = polygon[j].lat, yj = polygon[j].lng;
      const intersect = ((yi > point.lng) !== (yj > point.lng)) && (point.lat < (xj - xi) * (point.lng - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  renderPlot(plot: Plot): void {
    if (!this.map || !this.isRenderablePlot(plot)) return;
    [this.parcelLayer, this.envelopeLayer, this.cadLayer].forEach(layer => layer && this.map?.removeLayer(layer));
    this.parcelLayer = this.envelopeLayer = this.cadLayer = undefined;

    const [lat, lng] = plot.coordinates;
    this.map.setView([lat, lng] as L.LatLngTuple, 17);
    const coords = plot.geojson.coordinates[0].map(c => [c[1], c[0]] as [number, number]);
    if (this.showParcel) this.parcelLayer = L.polygon(coords, { color: '#10b981', weight: 3, fillColor: '#10b981', fillOpacity: 0.25 }).addTo(this.map);
    if (this.showEnvelope) this.envelopeLayer = L.polygon(coords.map(([plat, plng]) => [lat + (plat - lat) * 0.82, lng + (plng - lng) * 0.82] as [number, number]), { color: '#34d399', weight: 2, fillColor: '#34d399', fillOpacity: 0.4 }).addTo(this.map);
    if (this.showCadLayer) this.cadLayer = L.polyline(coords, { color: '#38bdf8', weight: 1, dashArray: '5 6' }).addTo(this.map);
    this.invalidateMapSize();
  }

  private initializeMap(plot: Plot): void {
    const [lat, lng] = plot.coordinates;
    this.map = L.map(this.mapContainerRef.nativeElement, { center: [lat, lng] as L.LatLngTuple, zoom: 17, zoomControl: true });
    L.tileLayer(environment.mapTileUrl, { maxZoom: 19, attribution: environment.mapAttribution }).addTo(this.map);
    this.map.on('click', event => this.onMapClick(event.latlng));
    this.resizeObserver = new ResizeObserver(() => this.invalidateMapSize());
    this.resizeObserver.observe(this.mapContainerRef.nativeElement);
    this.renderPlot(plot);
  }

  private invalidateMapSize(): void {
    requestAnimationFrame(() => this.map?.invalidateSize({ pan: false, animate: false }));
  }

  private isRenderablePlot(plot: Plot): boolean {
    return plot.id !== 'loading-plot' && plot.geojson.coordinates[0]?.length >= 3;
  }
}
