import { useEffect } from "react";
import type { ServerEvent } from "api/schema.ts";

type SseConfig<T extends ServerEvent> = {
	url: `/${string}`;
	events: {
		[K in T["name"]]: (data: Extract<T, { name: K }>["data"]) => void;
	};
};

export const useServerSentEvent = <T extends ServerEvent>(
	config: SseConfig<T>,
) => {
	useEffect(() => {
		const source = new EventSource(config.url);
		const eventDefinitions = Object.entries(config.events);

		for (const [eventName, handler] of eventDefinitions) {
			source.addEventListener(eventName, (event) => {
				const data = JSON.parse(event.data);
				handler(data);
			});
		}

		return () => source.close();
	}, []);
};
