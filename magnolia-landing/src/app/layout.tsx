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

export const metadata: Metadata = {
	title: "Iris Waitlist",
	description: "Be the first to experience the future of content creation.",
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
