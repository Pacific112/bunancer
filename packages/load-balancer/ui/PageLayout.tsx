import type React from "react";
import { Loader } from "lucide-react";
import { Button } from "$/components/ui/button.tsx";

export default function PageLayout({
	children,
	stylesheets,
}: {
	children: React.ReactNode;
	stylesheets: string[];
}) {
	return (
		<html>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{stylesheets.map((link) => (
					<link rel="stylesheet" key={link} href={link}></link>
				))}
				<title>Bunancer</title>
			</head>
			<body>
				<div className="min-h-screen flex flex-col">
					<header className="border-gray-200 border-b">
						<div className="flex h-14 items-center px-4 md:px-6">
							<a href="/" className="flex items-center gap-2 font-semibold text-gray-900">
								<Loader className="h-6 w-6" />
								<span>Bunancer</span>
							</a>
							<nav className="ml-auto flex gap-6 items-center">
								<a
									href="/"
									className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline"
								>
									Home
								</a>
								<a
									href="/faq"
									className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline"
								>
									FAQ
								</a>
								<a
									href="/roadmap"
									className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline"
								>
									Roadmap
								</a>
								<Button variant="outline" asChild>
									<a href="/dashboard">
									Dashboard
									</a>
								</Button>
							</nav>
						</div>
					</header>
					<main className="flex-1 ">
						<div className="container mx-auto px-4 py-12 md:px-6">{children}</div>
					</main>
					<footer className="border-t py-6 w-full">
						<div className="px-4">
							<div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
								<p>© 2025 Bunancer. All rights reserved.</p>
							</div>
						</div>
					</footer>
				</div>
			</body>
		</html>
	);
}
