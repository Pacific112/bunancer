import PageLayout from "$/PageLayout.tsx";

const faqItems = [
	{
		question: "What is Bunancer?",
		answer:
			"Bunancer is a very naive load balancer implementation that I treat as an exploratory project where I can experiment with different technologies and approaches. My original motivation was to learn Bun by building a project with non-trivial domain, and in the process I decided this was a good opportunity to build from scratch several things that I had never built before.",
	},
	{
		question: "Is it production ready?",
		answer:
			"No, and it is not intended to be. It's a project made for fun, to experiment with ideas and learn new things. I will try to use it in one of my side projects, but I would not recommend you do this on your own.",
	},
	{
		question: "What features are supported?",
		answer:
			"Basic load balancing using round robin algorithm, server registration, server pool monitoring (stats included), and health checks. More to come.",
	},
	{
		question: "What is interesting in this project?",
		answer:
			"For me personally, it's the amount of different things I was able to build from the ground up to make everything work together and to learn new concepts. Starting from CLI and SDK for managing servers, going through custom middleware and routing in Bun, manually setting up Server Side Rendering for React application, and finishing with real-time stats and server health updates.",
	},
	{
		question: "How router works and why have you router built into Bun?",
		answer:
			"I built this router before Bun added its own implementation in the 1.3 release. My router is based on a Trie data structure and supports path parameters in a type-safe way. HTTP methods are in the trie route and subsequent path parts create a whole tree structure. Each node can register a handler indicating that it can handle a given path, and thanks to Zod and TypeScript, I am able to extract path parameters and provide them to the handler in a type-safe way.",
	},
	{
		question: "How is React served?",
		answer:
			"It uses Server Side Rendering built into React. I use Bun to bundle the React application, and then the renderToReadableStream method is used to generate initial HTML which is later hydrated on the client. It works pretty well and has custom support for initial props, so I can initialize the whole state without any additional calls.",
	},
	{
		question: "How dashboard works?",
		answer:
			"The dashboard has two main responsibilities: giving an overview status of servers managed by the load balancer and visualizing how the underlying algorithm works. For the latter point, I wanted to use it in a mostly educational way, so I can easily show and explain how the next server to route requests to is selected. Another important aspect of the dashboard is that it allows modification of server responses for easier health checks testing.",
	},
	{
		question: "What is stub-server SDK?",
		answer:
			"In order to test if the load balancer works correctly, I wanted an easy way to spin up and kill new servers and modify their responses to check what happens in different conditions (for example timeouts, failed requests, etc.). The SDK was created exactly for this; it is used by the dashboard and CLI. Currently, it works only locally - it creates a new process for each server and communicates with them via IPC. I would like to extend support to container-based providers in the future.",
	},
	{
		question: "How server pool is managed?",
		answer:
			"The server pool is a group of servers to which Bunancer will be sending requests. Each new server that would like to join the pool can register itself by calling a dedicated endpoint. After registration, periodic health checks are sent to each server. If an unhealthy server is detected, no new requests are sent to it, and its health will be rechecked with exponential backoff. After a few failed retries, such a server is marked as dead and removed from the pool. When the load balancer is restarted, each registered server is checked to see if it's still alive before starting to route requests to it. Currently, only a single server pool is supported.",
	},
	{
		question: "What is the future of this project?",
		answer: "Check the Roadmap! I have a lot of ideas I would like to implement to make this project more fun and interesting.",
	},
];

export default function FAQPage({ stylesheets }: { stylesheets: string[] }) {
	return (
		<PageLayout stylesheets={stylesheets}>
			<h1 className="text-2xl font-semibold">Frequently Asked Questions</h1>

			<div className="mt-8 space-y-4">
				{faqItems.map((item, index) => (
					<div key={index} className="rounded-lg border bg-white">
						<div className="flex w-full items-center justify-between p-4 text-left font-medium">
							{item.question}
						</div>
						<div className="border-t p-4 text-sm text-gray-600">
							{item.answer}
						</div>
					</div>
				))}
			</div>
		</PageLayout>
	);
}
