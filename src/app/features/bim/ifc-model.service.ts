import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { IFCBUILDINGSTOREY, IfcAPI } from 'web-ifc';
import { STATIC_IFC } from '../../core/ai/static-ifc';
import { loadStaticIfcBytes } from './ifc-bytes.loader';

const MERGE_BATCH = 80;
const OUTLIER_MIN_DISTANCE = 40;
/** Bump when alignment math changes so an in-memory tilted parse is discarded. IndexedDB bytes stay. */
const ALIGN_VERSION = 2;


export interface IfcStoreyView {
  readonly id: number;
  readonly name: string;
  readonly index: number;
  readonly group: THREE.Group;
}

export interface ParsedIfcModel {
  readonly root: THREE.Group;
  readonly storeys: IfcStoreyView[];
  readonly footprint: { readonly width: number; readonly depth: number; readonly height: number };
  readonly selectable: THREE.Object3D[];
  readonly materials: THREE.MeshStandardMaterial[];
}

interface StoreyRecord {
  id: number;
  name: string;
  elevation: number;
  center: THREE.Vector3;
  group: THREE.Group;
}

interface MeshBatch {
  storey: StoreyRecord;
  typeName: string;
  colorKey: string;
  color: THREE.Color;
  opacity: number;
  geometries: THREE.BufferGeometry[];
  expressIds: number[];
}

@Injectable({ providedIn: 'root' })
export class IfcModelService {
  private parsed: ParsedIfcModel | null = null;
  private parsedAlignVersion = 0;
  private inFlight: Promise<ParsedIfcModel> | null = null;

  getCached(): ParsedIfcModel | null {
    return this.parsed && this.parsedAlignVersion === ALIGN_VERSION ? this.parsed : null;
  }

  load(onStatus: (status: string) => void): Promise<ParsedIfcModel> {
    const cached = this.getCached();
    if (cached) return Promise.resolve(cached);
    this.parsed = null;
    if (this.inFlight) return this.inFlight;
    this.inFlight = this.loadAndParse(onStatus)
      .then(model => {
        this.parsed = model;
        this.parsedAlignVersion = ALIGN_VERSION;
        return model;
      })
      .finally(() => {
        this.inFlight = null;
      });
    return this.inFlight;
  }

  private async loadAndParse(onStatus: (status: string) => void): Promise<ParsedIfcModel> {
    const { buffer } = await loadStaticIfcBytes(onStatus);
    onStatus(`Parsing ${STATIC_IFC.fileName}…`);
    return parseIfcModel(buffer);
  }
}

async function parseIfcModel(buffer: ArrayBuffer): Promise<ParsedIfcModel> {
  const ifcApi = new IfcAPI();
  const wasmBase = `${window.location.origin}/${STATIC_IFC.wasmPath}`.replace(/([^:]\/)\/+/g, '$1');
  ifcApi.SetWasmPath(wasmBase.endsWith('/') ? wasmBase : `${wasmBase}/`, true);
  await ifcApi.Init(file => {
    const name = String(file).split('/').pop() ?? String(file);
    return `${wasmBase.endsWith('/') ? wasmBase : `${wasmBase}/`}${name}`;
  }, true);

  const modelID = ifcApi.OpenModel(new Uint8Array(buffer), {
    COORDINATE_TO_ORIGIN: false,
    CIRCLE_SEGMENTS: 12
  });
  if (modelID < 0) {
    ifcApi.Dispose();
    throw new Error(`web-ifc could not open ${STATIC_IFC.fileName}`);
  }

  try {
    const allStoreys = readStoreys(ifcApi, modelID);
    const storeys = keepMainStoreyCluster(allStoreys);
    const keepIds = new Set(storeys.map(storey => storey.id));
    const expressToStorey = await mapElementsToStoreys(ifcApi, modelID, allStoreys);
    const upAxis = detectStoreyUpAxis(storeys);
    const { selectable, materials } = streamMeshes(ifcApi, modelID, allStoreys, expressToStorey, upAxis);
    const root = new THREE.Group();
    root.name = STATIC_IFC.fileName;
    for (const storey of allStoreys) {
      if (keepIds.has(storey.id)) root.add(storey.group);
    }

    dropOutlierStoreys(root, storeys);
    alignToGrid(root, storeys);
    sitOnGrid(root);
    scaleMillimetresToMetres(root);
    bakeWorldTransforms(root);

    const bounds = new THREE.Box3().setFromObject(root, true);
    const size = bounds.getSize(new THREE.Vector3());
    const visible = storeys.filter(storey => storey.group.parent === root);
    return {
      root,
      storeys: visible.map((storey, index) => ({
        id: storey.id,
        name: storey.name,
        index,
        group: storey.group
      })),
      footprint: { width: size.x, depth: size.z, height: size.y },
      selectable: selectable.filter(object => isDescendant(object, root)),
      materials
    };
  } finally {
    ifcApi.CloseModel(modelID);
    ifcApi.Dispose();
  }
}

function readStoreys(ifcApi: IfcAPI, modelID: number): StoreyRecord[] {
  const ids = ifcApi.GetLineIDsWithType(modelID, IFCBUILDINGSTOREY, true);
  const storeys: StoreyRecord[] = [];
  for (let i = 0; i < ids.size(); i++) {
    const id = ids.get(i);
    const line = safeLine(ifcApi, modelID, id);
    const name = lineLabel(line?.Name, line?.LongName) || `Storey ${id}`;
    const elevation = scalar(line?.Elevation);
    const center = storeyCenter(ifcApi, modelID, line, elevation);
    const group = new THREE.Group();
    group.name = name;
    storeys.push({ id, name, elevation, center, group });
  }
  storeys.sort((a, b) => a.elevation - b.elevation || a.center.z - b.center.z || a.center.y - b.center.y || a.id - b.id);
  if (storeys.length === 0) {
    const group = new THREE.Group();
    group.name = 'Building';
    storeys.push({ id: 0, name: 'Building', elevation: 0, center: new THREE.Vector3(), group });
  }
  return storeys;
}

function storeyCenter(ifcApi: IfcAPI, modelID: number, line: any, elevation: number): THREE.Vector3 {
  const placementId = refId(line?.ObjectPlacement);
  if (placementId) {
    try {
      const matrix = ifcApi.GetWorldTransformMatrix(modelID, placementId);
      if (matrix?.length === 16) {
        return new THREE.Vector3(matrix[12], matrix[13], matrix[14]);
      }
    } catch {
      // Fall through to elevation.
    }
  }
  return new THREE.Vector3(0, 0, elevation);
}

async function mapElementsToStoreys(
  ifcApi: IfcAPI,
  modelID: number,
  storeys: StoreyRecord[]
): Promise<Map<number, StoreyRecord>> {
  const byId = new Map(storeys.map(storey => [storey.id, storey]));
  const mapped = new Map<number, StoreyRecord>();
  try {
    const tree = await ifcApi.properties.getSpatialStructure(modelID, false);
    walkSpatial(tree, null, byId, mapped);
  } catch {
    // Assignment falls back to nearest storey during streaming.
  }
  return mapped;
}

function walkSpatial(
  node: { expressID: number; type: string; children?: Array<{ expressID: number; type: string; children?: any[] }> },
  current: StoreyRecord | null,
  byId: Map<number, StoreyRecord>,
  mapped: Map<number, StoreyRecord>
): void {
  const storey = isStoreyType(node.type) ? (byId.get(node.expressID) ?? current) : current;
  if (storey) mapped.set(node.expressID, storey);
  for (const child of node.children ?? []) walkSpatial(child, storey, byId, mapped);
}

function isStoreyType(type: string): boolean {
  return type.replace(/[^a-z]/gi, '').toLowerCase() === 'ifcbuildingstorey';
}

function keepMainStoreyCluster(storeys: StoreyRecord[]): StoreyRecord[] {
  if (storeys.length < 3) return storeys;
  const sorted = [...storeys].sort((a, b) => a.elevation - b.elevation);
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = Math.abs(sorted[i].elevation - sorted[i - 1].elevation);
    if (gap > 1e-6) gaps.push(gap);
  }
  if (!gaps.length) return storeys;
  const typical = median(gaps);
  const split = Math.max(typical * 6, typical + 1);
  let bestStart = 0;
  let bestLen = 1;
  let start = 0;
  let len = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (Math.abs(sorted[i].elevation - sorted[i - 1].elevation) <= split) {
      len += 1;
    } else {
      if (len > bestLen) {
        bestStart = start;
        bestLen = len;
      }
      start = i;
      len = 1;
    }
  }
  if (len > bestLen) {
    bestStart = start;
    bestLen = len;
  }
  const keep = new Set(sorted.slice(bestStart, bestStart + bestLen).map(storey => storey.id));
  return storeys.filter(storey => keep.has(storey.id));
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function detectStoreyUpAxis(storeys: StoreyRecord[]): 0 | 1 | 2 {
  if (storeys.length < 2) return 2;
  const lowest = storeys[0];
  const highest = storeys[storeys.length - 1];
  const delta = highest.center.clone().sub(lowest.center);
  const axes: Array<[0 | 1 | 2, number]> = [
    [0, Math.abs(delta.x)],
    [1, Math.abs(delta.y)],
    [2, Math.abs(delta.z)]
  ];
  axes.sort((a, b) => b[1] - a[1]);
  return axes[0][1] > 1e-4 ? axes[0][0] : 2;
}

function streamMeshes(
  ifcApi: IfcAPI,
  modelID: number,
  storeys: StoreyRecord[],
  expressToStorey: Map<number, StoreyRecord>,
  upAxis: 0 | 1 | 2
): { selectable: THREE.Object3D[]; materials: THREE.MeshStandardMaterial[] } {
  const batches = new Map<string, MeshBatch>();
  const selectable: THREE.Object3D[] = [];
  const materials: THREE.MeshStandardMaterial[] = [];

  const flush = (batch: MeshBatch): void => {
    if (!batch.geometries.length) return;
    let merged: THREE.BufferGeometry | null = null;
    try {
      merged = mergeGeometries(batch.geometries, false);
    } catch {
      merged = null;
    }
    const geometries = merged ? [merged] : batch.geometries.slice();
    if (merged) {
      for (const geometry of batch.geometries) geometry.dispose();
    }
    batch.geometries = [];
    const material = new THREE.MeshStandardMaterial({
      color: batch.color,
      roughness: 0.48,
      metalness: 0.04,
      transparent: batch.opacity < 0.999,
      opacity: batch.opacity,
      side: THREE.FrontSide
    });
    materials.push(material);
    for (const geometry of geometries) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      mesh.userData = {
        id: `IFC-${batch.expressIds[0] ?? batch.storey.id}`,
        type: batch.typeName,
        floor: batch.storey.name,
        areaM2: estimateArea(geometry),
        material: batch.typeName
      };
      batch.storey.group.add(mesh);
      selectable.push(mesh);
    }
    batch.expressIds = [];
  };

  ifcApi.StreamAllMeshes(modelID, mesh => {
    try {
      const typeName = ifcApi.GetNameFromTypeCode(ifcApi.GetLineType(modelID, mesh.expressID)) || 'IfcProduct';
      let storey = expressToStorey.get(mesh.expressID);
      const placedCount = mesh.geometries.size();
      for (let i = 0; i < placedCount; i++) {
        const placed = mesh.geometries.get(i);
        const geometry = placedGeometryToBuffer(ifcApi, modelID, placed);
        if (!geometry) continue;
        if (!storey) {
          const origin = new THREE.Vector3().setFromMatrixPosition(new THREE.Matrix4().fromArray(placed.flatTransformation));
          storey = nearestStorey(storeys, origin, upAxis);
          expressToStorey.set(mesh.expressID, storey);
        }
        const color = new THREE.Color(placed.color.x, placed.color.y, placed.color.z);
        const opacity = placed.color.w ?? 1;
        const colorKey = `${color.getHexString()}-${opacity.toFixed(2)}`;
        const key = `${storey.id}|${typeName}|${colorKey}`;
        let batch = batches.get(key);
        if (!batch) {
          batch = { storey, typeName, colorKey, color, opacity, geometries: [], expressIds: [] };
          batches.set(key, batch);
        }
        batch.geometries.push(geometry);
        batch.expressIds.push(mesh.expressID);
        if (batch.geometries.length >= MERGE_BATCH) flush(batch);
      }
    } catch (error) {
      console.warn('Skipped IFC mesh', mesh?.expressID, error);
    } finally {
      safeDelete(mesh);
    }
  });

  for (const batch of batches.values()) flush(batch);
  return { selectable, materials };
}

function placedGeometryToBuffer(
  ifcApi: IfcAPI,
  modelID: number,
  placed: { geometryExpressID: number; flatTransformation: number[] }
): THREE.BufferGeometry | null {
  const ifcGeom = ifcApi.GetGeometry(modelID, placed.geometryExpressID);
  try {
    const verts = ifcApi.GetVertexArray(ifcGeom.GetVertexData(), ifcGeom.GetVertexDataSize());
    const indices = ifcApi.GetIndexArray(ifcGeom.GetIndexData(), ifcGeom.GetIndexDataSize());
    if (!verts?.length || !indices?.length) return null;

    let maxIndex = 0;
    for (let i = 0; i < indices.length; i++) if (indices[i] > maxIndex) maxIndex = indices[i];
    const vertexCount = maxIndex + 1;
    const stride = vertexCount > 0 ? Math.round(verts.length / vertexCount) : 6;
    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    for (let i = 0; i < vertexCount; i++) {
      const offset = i * stride;
      positions[i * 3] = verts[offset];
      positions[i * 3 + 1] = verts[offset + 1];
      positions[i * 3 + 2] = verts[offset + 2];
      if (stride >= 6) {
        normals[i * 3] = verts[offset + 3];
        normals[i * 3 + 1] = verts[offset + 4];
        normals[i * 3 + 2] = verts[offset + 5];
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    if (stride >= 6) geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    else geometry.computeVertexNormals();
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.applyMatrix4(new THREE.Matrix4().fromArray(placed.flatTransformation));
    return geometry;
  } finally {
    safeDelete(ifcGeom);
  }
}

function safeDelete(value: { delete?: () => void } | null | undefined): void {
  if (typeof value?.delete === 'function') {
    value.delete();
  }
}

function nearestStorey(storeys: StoreyRecord[], point: THREE.Vector3, upAxis: 0 | 1 | 2): StoreyRecord {
  let best = storeys[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const storey of storeys) {
    const dist = Math.abs(point.getComponent(upAxis) - storey.center.getComponent(upAxis));
    if (dist < bestDist) {
      best = storey;
      bestDist = dist;
    }
  }
  return best;
}

function alignToGrid(root: THREE.Group, storeys: StoreyRecord[]): void {
  root.updateMatrixWorld(true);
  const slab = findBottomSlab(root, storeys);
  if (!slab) return;

  const slabBox = new THREE.Box3().setFromObject(slab, true);
  const modelBox = new THREE.Box3().setFromObject(root, true);
  if (slabBox.isEmpty() || modelBox.isEmpty()) return;

  const slabSize = slabBox.getSize(new THREE.Vector3());
  const down = slabDownNormal(slabBox, slabSize, modelBox);
  const ontoGrid = new THREE.Vector3(0, -1, 0);
  if (down.angleTo(ontoGrid) > 1e-4) {
    const rotation = new THREE.Quaternion().setFromUnitVectors(down, ontoGrid);
    bakeMatrix(root, new THREE.Matrix4().makeRotationFromQuaternion(rotation));
  }

  root.updateMatrixWorld(true);
  const slabAfter = new THREE.Box3().setFromObject(slab, true);
  const modelAfter = new THREE.Box3().setFromObject(root, true);
  if (!slabAfter.isEmpty() && !modelAfter.isEmpty()) {
    const below = slabAfter.min.y - modelAfter.min.y;
    const above = modelAfter.max.y - slabAfter.max.y;
    if (below > above + 1e-4) {
      bakeMatrix(root, new THREE.Matrix4().makeRotationX(Math.PI));
    }
  }
}

function findBottomSlab(root: THREE.Group, storeys: StoreyRecord[]): THREE.Mesh | null {
  const lowest = [...storeys].sort((a, b) => a.elevation - b.elevation)[0];
  const scored: Array<{ mesh: THREE.Mesh; score: number }> = [];

  root.traverse(object => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const box = new THREE.Box3().setFromObject(mesh, true);
    if (box.isEmpty()) return;
    const size = box.getSize(new THREE.Vector3());
    const dims = [size.x, size.y, size.z].sort((a, b) => a - b);
    const thickness = dims[0];
    const mid = dims[1];
    const length = dims[2];
    if (length < 1e-4) return;
    const area = mid * length;
    const flat = thickness <= mid * 0.45;
    if (!flat && area < mid * length * 0.5) return;
    const typeName = String(mesh.userData?.type ?? '');
    const isSlabType = /slab|footing|foundation|plate/i.test(typeName);
    const inLowest = lowest ? isDescendant(mesh, lowest.group) : false;
    const score = (area / Math.max(thickness, 1e-4))
      * (isSlabType ? 4 : 1)
      * (inLowest ? 5 : 1)
      * (flat ? 2 : 0.25);
    scored.push({ mesh, score });
  });

  scored.sort((a, b) => b.score - a.score);
  if (scored[0]) return scored[0].mesh;

  if (lowest) {
    let fallback: THREE.Mesh | null = null;
    let bestArea = 0;
    lowest.group.traverse(object => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      const box = new THREE.Box3().setFromObject(mesh, true);
      if (box.isEmpty()) return;
      const size = box.getSize(new THREE.Vector3());
      const area = Math.max(size.x * size.y, size.x * size.z, size.y * size.z);
      if (area > bestArea) {
        bestArea = area;
        fallback = mesh;
      }
    });
    if (fallback) return fallback;
  }
  return null;
}

function slabDownNormal(slabBox: THREE.Box3, slabSize: THREE.Vector3, modelBox: THREE.Box3): THREE.Vector3 {
  const dims = [slabSize.x, slabSize.y, slabSize.z];
  let thinAxis: 0 | 1 | 2 = 0;
  if (dims[1] < dims[thinAxis]) thinAxis = 1;
  if (dims[2] < dims[thinAxis]) thinAxis = 2;

  const slabCenter = slabBox.getCenter(new THREE.Vector3());
  const modelCenter = modelBox.getCenter(new THREE.Vector3());
  const towardBuilding = modelCenter.getComponent(thinAxis) - slabCenter.getComponent(thinAxis);
  const normal = new THREE.Vector3();
  normal.setComponent(thinAxis, towardBuilding >= 0 ? -1 : 1);
  return normal;
}

function bakeMatrix(root: THREE.Object3D, matrix: THREE.Matrix4): void {
  root.updateMatrixWorld(true);
  root.traverse(object => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.applyMatrix4(matrix);
    mesh.geometry.computeBoundingBox();
    mesh.geometry.computeBoundingSphere();
  });
  root.updateMatrixWorld(true);
}

function sitOnGrid(root: THREE.Group): void {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root, true);
  if (box.isEmpty()) return;
  const center = box.getCenter(new THREE.Vector3());
  bakeMatrix(root, new THREE.Matrix4().makeTranslation(-center.x, -box.min.y, -center.z));
}

function dropOutlierStoreys(root: THREE.Group, storeys: StoreyRecord[]): void {
  const measured = storeys
    .map(storey => {
      const box = new THREE.Box3().setFromObject(storey.group, true);
      return { storey, box, center: box.getCenter(new THREE.Vector3()), size: box.getSize(new THREE.Vector3()) };
    })
    .filter(item => !item.box.isEmpty());
  if (measured.length < 2) return;

  measured.sort((a, b) => b.size.x * b.size.y * b.size.z - a.size.x * a.size.y * a.size.z);
  const main = measured[0];
  const footprint = Math.hypot(main.size.x, main.size.z);
  const limit = Math.max(OUTLIER_MIN_DISTANCE, footprint * 2.5);
  for (const item of measured) {
    if (item.center.distanceTo(main.center) > limit) {
      root.remove(item.storey.group);
    }
  }
}

function scaleMillimetresToMetres(root: THREE.Group): void {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root, true);
  if (box.isEmpty()) return;
  const size = box.getSize(new THREE.Vector3());
  if (Math.max(size.x, size.y, size.z) > 500) {
    root.scale.multiplyScalar(0.001);
    root.updateMatrixWorld(true);
  }
}

function bakeWorldTransforms(root: THREE.Group): void {
  root.updateMatrixWorld(true);
  root.traverse(object => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.applyMatrix4(mesh.matrixWorld);
    mesh.geometry.computeBoundingBox();
    mesh.geometry.computeBoundingSphere();
  });
  root.traverse(object => {
    object.position.set(0, 0, 0);
    object.rotation.set(0, 0, 0);
    object.scale.set(1, 1, 1);
    object.updateMatrix();
  });
  root.updateMatrixWorld(true);
}

function isDescendant(object: THREE.Object3D, root: THREE.Object3D): boolean {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (current === root) return true;
    current = current.parent;
  }
  return false;
}

function estimateArea(geometry: THREE.BufferGeometry): number {
  geometry.computeBoundingBox();
  const size = geometry.boundingBox?.getSize(new THREE.Vector3());
  return size ? Math.round(Math.max(size.x * size.z, size.x * size.y, size.z * size.y)) : 0;
}

function safeLine(ifcApi: IfcAPI, modelID: number, id: number): any {
  try {
    return ifcApi.GetLine(modelID, id, false);
  } catch {
    return null;
  }
}

function refId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value && typeof value === 'object' && 'value' in value) {
    const inner = (value as { value: unknown }).value;
    if (typeof inner === 'number') return inner;
  }
  return null;
}

function scalar(value: unknown): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object' && 'value' in value) {
    const inner = Number((value as { value: unknown }).value);
    return Number.isFinite(inner) ? inner : 0;
  }
  return 0;
}

function lineLabel(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object' && 'value' in value) {
      const inner = (value as { value: unknown }).value;
      if (typeof inner === 'string' && inner.trim()) return inner.trim();
    }
  }
  return '';
}
