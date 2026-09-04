/** Single static IFC used by the BIM viewer and as the only IFC context for AVRA AI on that tab. */
export const STATIC_IFC = {
  fileName: 'modelo.ifc',
  assetUrl: 'assets/ifc/modelo.ifc',
  wasmPath: 'assets/wasm/',
  uri: 's3://avra-nzeishb-data-dev/IFC/demo/modelo.ifc',
  viewerHttpsUrls: [
    'https://avra-nzeishb-data-dev.s3.amazonaws.com/IFC/demo/modelo.ifc',
    'https://s3.amazonaws.com/avra-nzeishb-data-dev/IFC/demo/modelo.ifc'
  ]
} as const;

export type StaticIfcRef = {
  readonly fileName: typeof STATIC_IFC.fileName;
  readonly uri: typeof STATIC_IFC.uri;
};

export function staticIfcRef(): StaticIfcRef {
  return { fileName: STATIC_IFC.fileName, uri: STATIC_IFC.uri };
}
