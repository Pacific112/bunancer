import { Button } from "$/components/ui/button";
import PageLayout from "$/PageLayout.tsx";

export default function NotFoundPage({
	stylesheets,
}: {
	stylesheets: string[];
}) {
	return (
		<PageLayout stylesheets={stylesheets}>
			<div className="text-center">
				<h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
				<p className="text-xl text-gray-600 mb-8">
					Oops! The page you're looking for doesn't exist.
				</p>
				<Button asChild>
					<a href="/">Go back home</a>
				</Button>
			</div>
		</PageLayout>
	);
}
