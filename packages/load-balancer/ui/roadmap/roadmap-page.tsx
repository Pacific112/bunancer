import PageLayout from "$/PageLayout.tsx";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "$/components/ui/card.tsx";
import {
	BarChart3,
	Code2,
	Cpu,
	Database,
	Lightbulb,
	Mic,
	Network,
	Scale,
	ScrollText,
	TestTube,
	Users,
} from "lucide-react";
import { Badge } from "$/components/ui/badge.tsx";

type RoadmapItem = {
	title: string;
	details: string;
	status: "completed" | "in progress" | "planned";
	icon: React.ReactNode;
};

const roadmapItems: RoadmapItem[] = [
	{
		title: "Project Inception",
		details:
			"Initial concept development and research into Bun's capabilities for load balancing.",
		status: "completed",
		icon: <Lightbulb className="w-5 h-5" />,
	},
	{
		title: "Core Functionality",
		details:
			"Implement basic load balancing algorithms and server health checks. Introduce SDK for providing test servers. Dashboard for visualizing current status of Load Balancer.",
		status: "completed",
		icon: <Cpu className="w-5 h-5" />,
	},
	{
		title: "Separate environments per client.",
		details:
			"Support for client-specific server environments with isolated resources and configuration, allowing multiple applications to use the load balancer independently.",
		status: "in progress",
		icon: <Users className="w-5 h-5" />,
	},
	{
		title: "Multiple Server Pools",
		details:
			"Support for managing multiple server pools simultaneously with conditional routing rules based on request properties such as headers, paths, or client information. This enables more complex deployment scenarios and traffic management strategies.",
		status: "planned",
		icon: <Network className="w-5 h-5" />,
	},
	{
		title: "Persistent Storage",
		details:
			"Replace the current file-based storage system with a more robust persistent storage solution. This will enable proper separation between the dashboard and load balancer processes, improving stability and allowing independent scaling of components.",
		status: "planned",
		icon: <Database className="w-5 h-5" />,
	},
	{
		title: "Testing Module",
		details:
			"A built-in testing module that allows users to configure and execute load tests directly from the dashboard.",
		status: "planned",
		icon: <TestTube className="w-5 h-5" />,
	},
	{
		title: "StatsD and OpenTelemetry",
		details:
			"Replace the current in-memory statistics with StatsD database integration and implement OpenTelemetry support for comprehensive monitoring. This will enable better visualization of metrics and integration with popular monitoring tools.",
		status: "planned",
		icon: <BarChart3 className="w-5 h-5" />,
	},
	{
		title: "TypeSafe router and client.",
		details:
			"Replace manually created types with automatically inferred ones based on router configuration. This will allow clients to implement API interactions in a fully type-safe manner, reducing errors and improving developer experience when integrating with Bunancer",
		status: "planned",
		icon: <Code2 className="w-5 h-5" />,
	},
	{
		title: "Log aggregation",
		details:
			"Implement efficient log collection, storage, and streaming capabilities with search functionality. This will provide better visibility into system behavior and simplify troubleshooting across distributed server environments.",
		status: "planned",
		icon: <ScrollText className="w-5 h-5" />,
	},
	{
		title: "Auto Scaling and more routing algorithms",
		details:
			"Introduce weighted round-robin, least connections, and resource-based routing algorithms. Add automatic scaling capabilities that adjust the server pool size based on request volume, response times, and other customizable metrics.",
		status: "planned",
		icon: <Scale className="w-5 h-5" />,
	},
	{
		title: "Voice control",
		details:
			"Implement voice recognition capabilities that allow administrators to control and query the load balancer through spoken commands. This experimental feature aims to explore novel ways of interacting with infrastructure components.",
		status: "planned",
		icon: <Mic className="w-5 h-5" />,
	},
];

const statusColors = {
	completed: "text-green-500",
	"in progress": "text-blue-500",
	planned: "text-gray-500",
};

function RoadmapPoint({ item }: { item: RoadmapItem }) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center gap-4 space-y-0">
				<div className={`rounded-full ${statusColors[item.status]}`}>
					{item.icon}
				</div>
				<div className="flex-1">
					<div className="flex justify-between items-center">
						<CardTitle className="text-lg">{item.title}</CardTitle>
						<Badge
							variant={item.status === "completed" ? "default" : "secondary"}
							className="text-xs"
						>
							{item.status}
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex items-start gap-3">
					<p className="text-sm text-muted-foreground">{item.details}</p>
				</div>
			</CardContent>
		</Card>
	);
}

export const RoadmapPage = ({ stylesheets }: { stylesheets: string[] }) => {
	return (
		<PageLayout stylesheets={stylesheets}>
			<h1 className="text-2xl font-semibold">Roadmap</h1>
			<div className="mt-8 space-y-4">
				{roadmapItems.map((item, index) => (
					<RoadmapPoint key={index} item={item} />
				))}
			</div>
		</PageLayout>
	);
};
