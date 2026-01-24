"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "../../public/logo.png";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Logo with pulse animation */}
        <div className="loading-logo">
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-xl shadow-emerald-200/50">
            <Image
              src={Logo}
              alt="Cricket Scoring System"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* App Name */}
        <div className="loading-text text-center">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Cricket Scoring
          </h1>
          <p className="text-sm text-gray-500 mt-1">Live Match Management</p>
        </div>

        {/* Loading indicator */}
        <div className="loading-text flex flex-col items-center gap-4 mt-2">
          {/* Shimmer bar */}
          <div className="w-48 h-1 bg-emerald-100 rounded-full overflow-hidden">
            <div className="loading-bar w-full h-full rounded-full" />
          </div>

          {/* Bouncing dots */}
          <div className="flex items-center gap-1.5">
            <div className="loading-dot w-2 h-2 bg-emerald-500 rounded-full" />
            <div className="loading-dot w-2 h-2 bg-emerald-500 rounded-full" />
            <div className="loading-dot w-2 h-2 bg-emerald-500 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
