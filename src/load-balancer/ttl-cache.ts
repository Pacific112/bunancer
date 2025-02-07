export class TtlCache<KEY, VALUE> {
	#map = new Map<KEY, Partial<VALUE>>();
	#timeoutIds = new Map<KEY, Timer>();

	get(key: KEY) {
		return this.#map.get(key);
	}

	set(key: KEY, value: Partial<VALUE>, ttl: number) {
		const old = this.get(key) ?? {};
		this.#map.set(key, { ...old, ...value });
		this.#clearTimer(key);
		setTimeout(() => this.#map.delete(key), ttl);
	}

	#clearTimer(key: KEY) {
		this.#timeoutIds.delete(key);
		clearTimeout(this.#timeoutIds.get(key));
	}
}
