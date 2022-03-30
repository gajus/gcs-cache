export enum CompressionMethod {
  GZIP = 'gzip',
  ZSTD = 'zstd'
}

export type CacheHitKindState = 'exact' | 'none';

export type State = {
  bucket: string,
  cacheHitKind: CacheHitKindState,
  paths: readonly string[],
  targetFileName: string,
};

export type ObjectMetadata = {
  metadata: CacheActionMetadata,
  updated: string,
};

export type CacheActionMetadata = {
  'cache-action-compression-method': CompressionMethod,
};

export type Inputs = {
  readonly bucket: string,
  readonly key: string,
  readonly paths: readonly string[],
};
