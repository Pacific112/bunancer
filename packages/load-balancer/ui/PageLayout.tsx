import type React from "react";
import { Building2, HelpCircle, LayoutDashboard, Menu } from "lucide-react";

import { Button } from "$/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "$/components/ui/sheet";

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
					<header className="border-b">
						<div className="flex h-16 items-center justify-between px-4">
							<div className="flex items-center gap-6">
								<Sheet>
									<SheetTrigger asChild>
										<Button variant="ghost" size="icon" className="lg:hidden">
											<Menu className="h-6 w-6" />
											<span className="sr-only">Toggle navigation menu</span>
										</Button>
									</SheetTrigger>
									<SheetContent side="left">
										<SheetHeader>
											<SheetTitle>Navigation</SheetTitle>
										</SheetHeader>
										<nav className="flex flex-col gap-4 mt-4 px-4">
											<a
												href="/dashboard"
												className="flex items-center gap-2 text-sm font-medium"
											>
												<LayoutDashboard className="h-4 w-4" />
												Dashboard
											</a>
											<a
												href="/faq"
												className="flex items-center gap-2 text-sm font-medium"
											>
												<HelpCircle className="h-4 w-4" />
												FAQ
											</a>
										</nav>
									</SheetContent>
								</Sheet>
								<a href="/" className="flex items-center gap-2">
									<Building2 className="h-6 w-6" />
									<span className="font-semibold hidden md:inline-block">
										Bunancer
									</span>
								</a>
							</div>
							<nav className="hidden lg:flex items-center gap-6">
								<a href="/dashboard" className="text-sm font-medium">
									Dashboard
								</a>
								<a href="/faq" className="text-sm font-medium">
									FAQ
								</a>
							</nav>
							<div className="flex items-center gap-4">
								<div className="flex items-center gap-2">
									<div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
										<Building2 className="h-4 w-4 text-muted-foreground" />
									</div>
									<div className="hidden md:block">
										<p className="text-sm font-medium">Acme Corp</p>
									</div>
								</div>
							</div>
						</div>
					</header>
					<main className="flex-1">
						<div className="w-full py-6 px-4">{children}</div>
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
