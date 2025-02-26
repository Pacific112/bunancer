import PageLayout from "$/PageLayout.tsx";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "$/components/ui/card.tsx";
import { CheckCircle, Circle } from "lucide-react";
import { Badge } from "$/components/ui/badge.tsx";

type RoadmapItem = {
	title: string;
	details: string;
	status: "completed" | "in progress" | "planned";
};

const roadmapItems: RoadmapItem[] = [
	{
		title: "Project Inception",
		details:
			"Initial concept development and research into Bun's capabilities for load balancing.",
		status: "completed",
	},
	{
		title: "Core Functionality",
		details:
			"Implement basic load balancing algorithms and server health checks.",
		status: "completed",
	},
	{
		title: "Dashboard Development",
		details:
			"Create a user-friendly dashboard for monitoring and managing server pools.",
		status: "in progress",
	},
	{
		title: "Advanced Features",
		details:
			"Add support for SSL termination, WebSocket proxying, and custom load balancing rules.",
		status: "planned",
	},
	{
		title: "Performance Optimization",
		details:
			"Fine-tune the load balancer for maximum throughput and minimal latency.",
		status: "planned",
	},
	{
		title: "Documentation and Tutorials",
		details:
			"Comprehensive documentation and educational resources for users and contributors.",
		status: "planned",
	},
];

const statusColors = {
	completed: "text-green-500",
	"in progress": "text-blue-500",
	planned: "text-gray-500",
};

function RoadmapPoint({
	item,
	isLast,
}: {
	item: RoadmapItem;
	isLast: boolean;
}) {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center gap-4 space-y-0">
				<div className={`rounded-full ${statusColors[item.status]}`}>
					{item.status === "completed" ? (
						<CheckCircle className="w-4 h-4" />
					) : (
						<Circle className="w-4 h-4" />
					)}
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
				<p className="text-sm text-muted-foreground">{item.details}</p>
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
					<RoadmapPoint
						key={index}
						item={item}
						isLast={index === roadmapItems.length - 1}
					/>
				))}
			</div>
		</PageLayout>
	);
};
