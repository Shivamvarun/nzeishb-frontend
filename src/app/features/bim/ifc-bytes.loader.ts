import { STATIC_IFC, staticAssetUrl } from '../../core/ai/static-ifc';

const DB_NAME = 'nzeishb-ifc-cache';
const STORE_NAME = 'ifc-files';
const DB_VERSION = 1;

export type IfcBytesSource = 'indexeddb' | 'asset';

export interface LoadedIfcBytes {
  readonly buffer: ArrayBuffer;
  readonly source: IfcBytesSource;
}

export async function loadStaticIfcBytes(
  onStatus: (status: string) => void
): Promise<LoadedIfcBytes> {
  onStatus(`Checking cached ${STATIC_IFC.fileName}…`);
  const cached = await readCachedIfc().catch(() => null);
  if (cached && isIfcBuffer(cached)) {
    onStatus(`Loading ${STATIC_IFC.fileName} from cache…`);
    return { buffer: cached, source: 'indexeddb' };
  }

  onStatus(`Loading ${STATIC_IFC.fileName} from app assets…`);
  const assetUrl = staticAssetUrl(STATIC_IFC.assetUrl);
  const response = await fetch(assetUrl);
  if (!response.ok) {
    throw new Error(`Could not load ${STATIC_IFC.fileName} from ${assetUrl}`);
  }
  const fromAsset = await response.arrayBuffer();
  if (!isIfcBuffer(fromAsset)) {
    throw new Error(`${STATIC_IFC.fileName} from ${assetUrl} is not a valid IFC file`);
  }
  onStatus(`Saving ${STATIC_IFC.fileName} locally…`);
  await persistIfc(fromAsset).catch(() => undefined);
  return { buffer: fromAsset, source: 'asset' };
}

function isIfcBuffer(buffer: ArrayBuffer): boolean {
  if (!buffer || buffer.byteLength < 16) return false;
  const head = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(buffer, 0, Math.min(80, buffer.byteLength)));
  return head.includes('ISO-10303-21') || /ISO-10303/i.test(head);
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readCachedIfc(): Promise<ArrayBuffer | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(STATIC_IFC.fileName);
    request.onsuccess = () => {
      const value = request.result as ArrayBuffer | Blob | undefined;
      if (!value) {
        resolve(null);
        return;
      }
      if (value instanceof Blob) {
        void value.arrayBuffer().then(resolve, reject);
        return;
      }
      resolve(value);
    };
    request.onerror = () => reject(request.error);
  });
}

async function persistIfc(buffer: ArrayBuffer): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const request = db
      .transaction(STORE_NAME, 'readwrite')
      .objectStore(STORE_NAME)
      .put(new Blob([buffer], { type: 'application/x-step' }), STATIC_IFC.fileName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
