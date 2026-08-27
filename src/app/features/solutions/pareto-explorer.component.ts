import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Subscription } from 'rxjs';
import { StoreService } from '../../core/state/store.service';
import { AppState, Variant } from '../../core/models/app.models';

interface Point { readonly variant: Variant; readonly x: number; readonly y: number; readonly r: number; }

@Component({
  selector: 'app-pareto-explorer',
  templateUrl: '../../components/pareto-explorer/pareto-explorer.component.html',
  styleUrls: ['../../components/pareto-explorer/pareto-explorer.component.css']
})
export class ParetoExplorerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pareto3d', { static: true }) private pareto3dRef!: ElementRef<HTMLDivElement>;

  state: AppState = this.store.getState();
  maxCost = 95000;
  maxEnergy = 45;
  minIndustrialization = 0;
  rotation = 20;
  viewMode: '3d' | '2d' = '3d';
  threeAvailable = true;

  private readonly subscription: Subscription;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private controls?: OrbitControls;
  private pointGroup = new THREE.Group();
  private frameId?: number;
  private readonly onResize = () => this.resize3d();

  constructor(private readonly store: StoreService) {
    this.subscription = this.store.state$.subscribe(current => {
      this.state = current;
      if (this.renderer) this.render3dPoints();
    });
  }

  get candidates(): readonly Variant[] { return this.state.variants.filter(v => v.id !== 'loading-variant'); }
  get paretoVariants(): readonly Variant[] { return this.candidates; }
  get visibleVariants(): readonly Variant[] {
    return this.candidates.filter(v => v.costPerUnit <= this.maxCost && v.primaryEnergyDemandKwh <= this.maxEnergy && v.degreeIndustrialization >= this.minIndustrialization / 100);
  }

  get points(): readonly Point[] {
    const variants = this.visibleVariants;
    if (!variants.length) return [];
    const costs = variants.map(v => v.costPerUnit);
    const energies = variants.map(v => v.primaryEnergyDemandKwh);
    const minC = Math.min(...costs, 60000), maxC = Math.max(...costs, 100000);
    const minE = Math.min(...energies, 10), maxE = Math.max(...energies, 50);
    const angle = this.rotation * Math.PI / 180;
    return variants.map(v => {
      const c = (v.costPerUnit - minC) / Math.max(maxC - minC, 1);
      const e = (v.primaryEnergyDemandKwh - minE) / Math.max(maxE - minE, 1);
      const z = v.degreeIndustrialization;
      return { variant: v, x: 80 + c * 610 + z * Math.cos(angle) * 90, y: 390 - e * 300 - z * Math.sin(angle) * 80, r: 7 + z * 7 };
    });
  }

  ngAfterViewInit(): void {
    this.init3d();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
    if (this.frameId !== undefined) cancelAnimationFrame(this.frameId);
    this.subscription.unsubscribe();
    this.controls?.dispose();
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
    this.renderer?.domElement.remove();
  }

  setViewMode(mode: '3d' | '2d'): void { this.viewMode = mode; if (mode === '3d') setTimeout(() => this.resize3d()); }
  selectVariant(id: string): void { this.store.setSelectedVariant(id); }
  compareVariant(id: string, event: Event): void { event.stopPropagation(); this.store.toggleComparedVariant(id); }
  isCompared(id: string): boolean { return this.state.comparedVariants.some(item => item.id === id); }
  runNsga3(): void { void this.store.optimize(); }

  private init3d(): void {
    try {
      const container = this.pareto3dRef.nativeElement;
      const width = Math.max(container.clientWidth, 500);
      const height = Math.max(container.clientHeight, 430);
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xf8fbf9);
      this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
      this.camera.position.set(95, 82, 120);
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(width, height, false);
      container.appendChild(this.renderer.domElement);
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = .08;
      this.controls.minDistance = 55;
      this.controls.maxDistance = 260;
      this.controls.target.set(0, 0, 0);
      this.scene.add(new THREE.AmbientLight(0xffffff, .9));
      const light = new THREE.DirectionalLight(0xffffff, .8);
      light.position.set(60, 100, 70);
      this.scene.add(light);
      this.scene.add(this.pointGroup);
      this.addAxes();
      this.render3dPoints();
      window.addEventListener('resize', this.onResize);
      this.animate3d();
    } catch {
      this.threeAvailable = false;
      this.viewMode = '2d';
    }
  }

  private addAxes(): void {
    if (!this.scene) return;
    const material = new THREE.LineBasicMaterial({ color: 0x334155 });
    const makeAxis = (a: THREE.Vector3, b: THREE.Vector3) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([a, b]);
      this.scene!.add(new THREE.Line(geometry, material));
    };
    makeAxis(new THREE.Vector3(-60, -35, -60), new THREE.Vector3(65, -35, -60));
    makeAxis(new THREE.Vector3(-60, -35, -60), new THREE.Vector3(-60, 65, -60));
    makeAxis(new THREE.Vector3(-60, -35, -60), new THREE.Vector3(-60, -35, 65));
    const grid = new THREE.GridHelper(125, 10, 0xc4ddca, 0xe4ece7);
    grid.position.y = -35;
    this.scene.add(grid);
  }

  private render3dPoints(): void {
    if (!this.scene) return;
    while (this.pointGroup.children.length) {
      const child = this.pointGroup.children[0];
      this.pointGroup.remove(child);
      const mesh = child as THREE.Mesh;
      mesh.geometry?.dispose();
      (mesh.material as THREE.Material)?.dispose();
    }
    const variants = this.visibleVariants;
    if (!variants.length) return;
    const minC = Math.min(...variants.map(v => v.costPerUnit), 60000);
    const maxC = Math.max(...variants.map(v => v.costPerUnit), 100000);
    const minE = Math.min(...variants.map(v => v.primaryEnergyDemandKwh), 10);
    const maxE = Math.max(...variants.map(v => v.primaryEnergyDemandKwh), 50);
    variants.forEach(v => {
      const x = -55 + ((v.costPerUnit - minC) / Math.max(maxC - minC, 1)) * 120;
      const y = -30 + v.degreeIndustrialization * 90;
      const z = 55 - ((v.primaryEnergyDemandKwh - minE) / Math.max(maxE - minE, 1)) * 120;
      const geometry = new THREE.SphereGeometry(4 + v.degreeIndustrialization * 3, 20, 20);
      const selected = v.id === this.state.selectedVariant.id;
      const material = new THREE.MeshStandardMaterial({ color: selected ? 0xf59e0b : 0x7e3db3, roughness: .4, metalness: .05 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.userData = v.id;
      this.pointGroup.add(mesh);
    });
  }

  private animate3d(): void {
    this.frameId = requestAnimationFrame(() => this.animate3d());
    this.controls?.update();
    if (this.renderer && this.scene && this.camera && this.viewMode === '3d') this.renderer.render(this.scene, this.camera);
  }

  private resize3d(): void {
    if (!this.renderer || !this.camera) return;
    const container = this.pareto3dRef.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }
}
