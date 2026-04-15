import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
	variable: "--font-serif",
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	display: "swap",
});

const manrope = Manrope({
	variable: "--font-manrope",
	subsets: ["latin"],
	display: "swap",
});

const siteUrl = "https://www.irisvideo.app";

export const metadata: Metadata = {
	title: "Iris Waitlist",
	description: "Be the first to experience the future of content creation.",
	metadataBase: new URL(siteUrl),
	openGraph: {
		title: "Iris Waitlist",
		description:
			"Be the first to experience the future of content creation.",
		url: siteUrl,
		siteName: "Iris",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Iris — The future of content creation",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Iris Waitlist",
		description:
			"Be the first to experience the future of content creation.",
		images: ["/og-image.png"],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${cormorant.variable} ${manrope.variable} h-full antialiased`}
		>
			<body
				className={`min-h-full bg-black text-white ${cormorant.className}`}
			>
				{children}
			</body>
		</html>
	);
}
