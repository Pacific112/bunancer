type ServerSentEvent = {
	name: string;
	data: unknown;
};
type CleanUp = () => void;
type EnqueueEvent<EVENT extends ServerSentEvent> = (event: EVENT) => void;
export type SseSetup<EVENT extends ServerSentEvent> = (
	enqueue: EnqueueEvent<EVENT>,
) => CleanUp;

const toPayload = (event: ServerSentEvent) => {
	return `event: ${event.name}\ndata: ${JSON.stringify(event.data)}\n\n`;
};

const pingEvent = () => ({ name: "ping", data: "ping" });
const encoder = () => {
	const textEncoder = new TextEncoder();
	return {
		encode: (ev: ServerSentEvent) => textEncoder.encode(toPayload(ev)),
	};
};

export const sse = <EVENT extends ServerSentEvent>(setup: SseSetup<EVENT>) => {
	const { encode } = encoder();
	let pingTimerId: Timer | undefined;
	let cleanUp: () => void = () => {};

	return () =>
		new Response(
			new ReadableStream({
				start: (controller) => {
					controller.enqueue(encode(pingEvent()));
					pingTimerId = setInterval(
						() => controller.enqueue(encode(pingEvent())),
						5000,
					);
					cleanUp = setup((event) => controller.enqueue(encode(event)));
				},
				cancel: () => {
					if (pingTimerId) clearInterval(pingTimerId);
					cleanUp();
				},
			}),
			{
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
				},
			},
		);
};
