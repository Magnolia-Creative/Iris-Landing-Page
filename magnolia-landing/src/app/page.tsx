import Header from "@/components/Header";
import LandingClient from "@/components/LandingClient";
import WaitlistForm from "@/components/WaitlistForm";

export default function Home() {
	return (
		<>
			<LandingClient />
			<Header />
			<main className="relative z-10 flex h-dvh flex-col items-center justify-end px-6 pb-[12vh]">
				<div className="flex flex-col items-center gap-6">
					<h1 className="typo-title text-center text-white/90">
						Join the Iris Waitlist
					</h1>
					<p className="typo-body max-w-sm text-center text-white/50">
						Be the first to experience the future of content
						creation. Drop your email and we&rsquo;ll let you know
						when we launch.
					</p>
					<WaitlistForm />
				</div>
			</main>
		</>
	);
}
