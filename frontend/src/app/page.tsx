"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-[calc(100dvh - 60px)] flex items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>
  );
}
