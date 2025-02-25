import DashboardPage from "$/dashboard/dashboard-page.tsx";
import FAQPage from "$/faq/faq-page.tsx";

export const pages = {
	"/faq": FAQPage,
	"/dashboard": DashboardPage,
} as const;

export type DashboardPages = typeof pages;
