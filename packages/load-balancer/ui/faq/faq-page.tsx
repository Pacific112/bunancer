import PageLayout from "$/PageLayout.tsx";

const faqItems = [
	{
		question: "What is Bunancer?",
		answer:
			"Bunancer is a naive load balancer implementation I created as an exploratory project to experiment with different technologies. My original motivation was to learn Bun by building something with non-trivial complexity. Along the way, I seized the opportunity to build several components from scratch that I had never attempted before.",
	},
	{
		question: "Is it production ready?",
		answer:
			"No, and it's not intended to be. This is a project made for fun, experimentation, and learning. While I plan to use it in my own side projects, I wouldn't recommend deploying it in production environments.",
	},
	{
		question: "What features are supported?",
		answer:
			"Currently supported features include basic load balancing using a round-robin algorithm, server registration, server pool monitoring with statistics, and health checks. More features are planned for future development.",
	},
	{
		question: "What is interesting in this project?",
		answer:
			"For me, the most interesting aspect is the variety of components I built from scratch to create a cohesive system while learning new concepts. These range from a CLI and SDK for server management, to custom middleware and routing in Bun, manually implementing Server Side Rendering for React, and creating real-time statistics with health monitoring.",
	},
	{
		question: "How router works and why have you router built into Bun?",
		answer:
			"I developed this router before Bun released its own implementation in version 1.3. My router is based on a Trie data structure that supports path parameters in a type-safe way. The HTTP methods are incorporated into the trie route, with path segments forming a tree structure. Each node can register a handler for a specific path, and by leveraging Zod with TypeScript, I extract path parameters and provide them to handlers in a type-safe manner.",
	},
	{
		question: "How is React served?",
		answer:
			"The app uses React's built-in Server Side Rendering capabilities. Bun bundles the React application, then renderToReadableStream generates the initial HTML that's later hydrated on the client. This approach works efficiently and includes custom support for initial props, allowing me to initialize the application state without additional API calls.",
	},
	{
		question: "How dashboard works?",
		answer:
			"The dashboard serves two main purposes: providing an overview of servers managed by the load balancer and visualizing how the underlying algorithm works. For the latter, I designed it to be educational, making it easy to demonstrate how the next server is selected for routing requests. The dashboard also allows modification of server responses to facilitate testing of health check mechanisms.",
	},
	{
		question: "What is stub-server SDK?",
		answer:
			"The stub-server SDK was created to test the load balancer by providing an easy way to spin up and terminate servers, as well as modify their responses to simulate different conditions like timeouts or failed requests. Currently used by both the dashboard and CLI, it works locally by creating a new process for each server and communicating via IPC. Future plans include extending support to container-based providers.",
	},
	{
		question: "How server pool is managed?",
		answer:
			"The server pool consists of servers to which Bunancer routes requests. New servers can join by registering through a dedicated endpoint. After registration, the system performs periodic health checks on each server. If an unhealthy server is detected, requests are no longer routed to it, and its health is rechecked with exponential backoff. After several failed attempts, the server is marked as dead and removed from the pool. When restarting the load balancer, all registered servers are verified before routing requests to them. Currently, only a single server pool is supported.",
	},
	{
		question: "What is the future of this project?",
		answer:
			"Check out the Roadmap section for details! I have numerous ideas planned to enhance this project and make it more robust, educational, and feature-rich while maintaining its experimental nature.",
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
