import { Button } from "$/components/ui/button";
import PageLayout from "$/PageLayout.tsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "$/components/ui/card.tsx";
import { Label } from "$/components/ui/label.tsx";
import { Input } from "$/components/ui/input.tsx";
import { Mail } from "lucide-react";

export default function UnauthorizedPage({
	stylesheets,
}: {
	stylesheets: string[];
}) {
	return (
		<PageLayout stylesheets={stylesheets}>
			<div className="flex-grow flex items-center justify-center p-4">
				<Card className="max-w-md w-full border border-gray-200 bg-white">
					<CardHeader>
						<CardTitle className="text-2xl text-gray-900">
							Unauthorized Access
						</CardTitle>
						<CardDescription className="text-gray-600">
							This is an invitation-only project. Please request access or
							return to the homepage.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<form className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email" className="text-gray-700">
									Request Access
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
						<div className="text-center">
							<span className="text-gray-600">or</span>
						</div>
						<Button
							asChild
							variant="outline"
							className="w-full border-gray-200 text-gray-600 hover:bg-gray-50"
						>
							<a href="/">Return to Homepage</a>
						</Button>
					</CardContent>
				</Card>
			</div>
		</PageLayout>
	);
}
