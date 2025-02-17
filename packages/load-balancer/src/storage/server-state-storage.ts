import type { StorageProvider } from "@/storage/types";
import type { PoolServer } from "@/pool/server.types";
import { FileStorageProvider } from "@/storage/file-storage";

const DEFAULT_FLUSH_INTERVAL = 30_000;

export class ServerStateStorage {
	#flushTimer?: Timer;
	#currentState: PoolServer[] = [];
	readonly #provider: StorageProvider;

	constructor() {
		this.#provider = new FileStorageProvider();
		this.#startPeriodicFlush();
	}

	saveState(servers: PoolServer[]) {
		this.#currentState = servers;
	}

	loadState() {
		return this.#provider.loadState();
	}

	#startPeriodicFlush() {
		this.#flushTimer = setInterval(() => {
			if (this.#currentState.length > 0) {
				this.#provider.saveState(this.#currentState);
				this.#currentState = [];
			}
		}, DEFAULT_FLUSH_INTERVAL);
	}

	dispose() {
		if (this.#flushTimer) {
			clearInterval(this.#flushTimer);
		}
	}
}
