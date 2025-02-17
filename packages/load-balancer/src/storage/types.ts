import type { PoolServer } from "@/pool/server.types";

export interface StorageProvider {
  saveState(servers: PoolServer[]): Promise<void>;
  loadState(): Promise<PoolServer[]>;
}

export type StorageConfig = {
  flushInterval?: number; // in milliseconds
}; 