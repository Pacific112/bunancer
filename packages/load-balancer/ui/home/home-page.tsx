import { Button } from "$/components/ui/button";
import { Input } from "$/components/ui/input";
import { Label } from "$/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "$/components/ui/card";
import PageLayout from "$/PageLayout.tsx";
import { Building2, Mail } from "lucide-react";

export default function HomePage({ stylesheets }: { stylesheets: string[] }) {
	return (
		<PageLayout stylesheets={stylesheets}>
			<div className="grid items-center gap-6">
				<div className="flex flex-col items-center gap-4 text-center">
					<span className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-600">
						Educational Project
					</span>
					<h1 className="text-3xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
						Load Balancing with Bun
					</h1>
					<p className="max-w-[600px] text-gray-600 md:text-xl">
						Bunancer is an experimental load balancer built with Bun. A learning
						project exploring high-performance server infrastructure.
					</p>
				</div>
				<div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:gap-12">
					<Card className="border border-gray-200 bg-white">
						<CardHeader>
							<CardTitle className="text-gray-900">
								Educational Purpose
							</CardTitle>
							<CardDescription className="text-gray-600">
								This project is built for learning and demonstration purposes.
								Not intended for production use.
							</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-4">
							<div className="flex items-center gap-4">
								<Building2 className="h-5 w-5 text-gray-500" />
								<div className="grid gap-1">
									<h3 className="font-medium text-gray-900">Built with Bun</h3>
									<p className="text-sm text-gray-600">
										Exploring the capabilities of Bun for high-performance
										networking
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className="border border-gray-200 bg-white">
						<CardHeader>
							<CardTitle className="text-gray-900">
								Request Early Access
							</CardTitle>
							<CardDescription className="text-gray-600">
								Leave your email to receive an invitation to try Bunancer.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form className="grid gap-4">
								<div className="grid gap-2">
									<Label htmlFor="email" className="text-gray-700">
										Email
									</Label>
									<div className="flex gap-2">
										<Input
											id="email"
											placeholder="you@example.com"
											type="email"
											className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
										/>
										<Button type="submit">
											<Mail className="mr-2 h-4 w-4" />
											Submit
										</Button>
									</div>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</PageLayout>
	);
}
