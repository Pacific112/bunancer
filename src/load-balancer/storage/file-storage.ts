import type { StorageProvider } from "load-balancer/storage/types.ts";
import type { PoolServer } from "load-balancer/server.types.ts";

export class FileStorageProvider implements StorageProvider {
  readonly #filePath: string;

  constructor(filePath: string = "./server-pool-state.json") {
    this.#filePath = filePath;
  }

  async saveState(servers: PoolServer[]): Promise<void> {
    console.log('rel save')
    const file = Bun.file(this.#filePath);
    await Bun.write(file, JSON.stringify(servers));
  }

  async loadState(): Promise<PoolServer[]> {
    const file = Bun.file(this.#filePath);
    if (!(await file.exists())) {
      return [];
    }
    return await file.json();
  }
} 