import { useState } from "react";
import { ChevronDown } from "lucide-react";
import PageLayout from "$/PageLayout.tsx";

export default function FAQPage({ stylesheets }: { stylesheets: string[] }) {
	const [openItem, setOpenItem] = useState<number | null>(null);

	const faqItems = [
		{
			question: "What is Bunancer?",
			answer:
				"Bunancer is a server monitoring and management platform that helps you track the health and status of your servers in real-time.",
		},
		{
			question: "How do I add a new server?",
			answer:
				"Click the 'Add Server' button in your server group to register a new server. You'll need to provide the server's URL and configure any specific monitoring parameters.",
		},
		{
			question: "What do the health status indicators mean?",
			answer:
				"The health status badge shows the current state of your server. 'Healthy' (black badge) indicates the server is running normally and responding to health checks. Other states may include 'Warning' or 'Error' depending on the server's response.",
		},
		{
			question: "Can I organize servers into groups?",
			answer:
				"Yes, you can create server groups (like 'Test' shown in the dashboard) to organize your servers by project, environment, or any other classification that makes sense for your infrastructure.",
		},
		{
			question: "How often are servers monitored?",
			answer:
				"Servers are monitored in real-time with regular health checks. The frequency of these checks can be configured based on your needs.",
		},
	];

	return (
		<PageLayout stylesheets={stylesheets}>
			<h1 className="text-2xl font-semibold">
				Frequently Asked Questions
			</h1>

			<div className="mt-8 space-y-4">
				{faqItems.map((item, index) => (
					<div key={index} className="rounded-lg border bg-white">
						<button
							onClick={() => setOpenItem(openItem === index ? null : index)}
							className="flex w-full items-center justify-between p-4 text-left"
						>
							<span className="font-medium">{item.question}</span>
							<ChevronDown
								className={`h-5 w-5 transition-transform ${openItem === index ? "rotate-180" : ""}`}
							/>
						</button>
						{openItem === index && (
							<div className="border-t p-4 text-sm text-gray-600">
								{item.answer}
							</div>
						)}
					</div>
				))}
			</div>
		</PageLayout>
	);
}
