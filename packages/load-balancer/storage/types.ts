import type { PoolServer } from "load-balancer/pool/server.types.ts";

export interface StorageProvider {
  saveState(servers: PoolServer[]): Promise<void>;
  loadState(): Promise<PoolServer[]>;
}

export type StorageConfig = {
  flushInterval?: number; // in milliseconds
}; 