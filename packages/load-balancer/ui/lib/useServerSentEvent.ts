import z, { ZodSchema } from "zod";
import { useEffect } from "react";

type SseConfig<T extends Record<string, ZodSchema>> = {
	url: `/${string}`;
	events: {
		[K in keyof T]: { schema: T[K]; handler: (data: z.infer<T[K]>) => void };
	};
};

export const useServerSentEvent = <T extends Record<string, ZodSchema>>(
	config: SseConfig<T>,
) => {
	useEffect(() => {
		const source = new EventSource(config.url);
		const eventDefinitions = Object.entries(config.events);

		for (const [eventName, { schema, handler }] of eventDefinitions) {
			source.addEventListener(eventName, (event) => {
				const data = JSON.parse(event.data);
				const result = schema.safeParse(data);
				handler(result.data);
			});
		}

		return () => source.close();
	}, []);
};
