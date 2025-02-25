import DashboardPage from "$/dashboard/dashboard-page.tsx";
import FAQPage from "$/faq/faq-page.tsx";
import HomePage from "$/home/home-page.tsx";

export const pages = {
	"/": HomePage,
	"/faq": FAQPage,
	"/dashboard": DashboardPage,
} as const;

export type DashboardPages = typeof pages;
