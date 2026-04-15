"use client";

import { useForm, ValidationError } from "@formspree/react";

export default function WaitlistForm() {
	const [state, handleSubmit] = useForm("myklkpya");

	if (state.succeeded) {
		return (
			<div className="flex flex-col items-center gap-3">
				<p className="typo-heading text-white/90">
					You&rsquo;re on the list.
				</p>
				<p className="typo-body text-white/50">
					We&rsquo;ll reach out when it&rsquo;s time.
				</p>
			</div>
		);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex w-full max-w-md flex-col items-center gap-4"
		>
			<div className="flex w-full items-center gap-3">
				<input
					type="email"
					name="email"
					required
					placeholder="Enter your email"
					className="typo-action flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-white placeholder:text-white/30 outline-none backdrop-blur-sm transition-colors focus:border-white/30 focus:bg-white/8"
				/>
				<button
					type="submit"
					disabled={state.submitting}
					className="typo-action shrink-0 cursor-pointer rounded-full bg-white px-6 py-3 text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{state.submitting ? "Joining…" : "Join"}
				</button>
			</div>

			<ValidationError
				field="email"
				errors={state.errors}
				className="typo-body-small text-red-400"
			/>
		</form>
	);
}
