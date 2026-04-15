"use client";

import dynamic from "next/dynamic";

const PointField = dynamic(() => import("@/components/PointField"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-black" aria-hidden />
  ),
});

export default function LandingClient() {
  return (
    <div className="fixed inset-0 z-0">
      <PointField />
    </div>
  );
}
