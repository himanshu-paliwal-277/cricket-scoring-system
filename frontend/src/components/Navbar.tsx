"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-emerald-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-xl font-bold">
            Cricket Scoring
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`hover:text-emerald-200 ${isActive("/dashboard") ? "font-bold" : ""}`}
            >
              Dashboard
            </Link>

            {user?.role !== "player" && (
              <>
                <Link
                  href="/players"
                  className={`hover:text-emerald-200 ${isActive("/players") ? "font-bold" : ""}`}
                >
                  Players
                </Link>
                <Link
                  href="/teams"
                  className={`hover:text-emerald-200 ${isActive("/teams") ? "font-bold" : ""}`}
                >
                  Teams
                </Link>
                <Link
                  href="/matches"
                  className={`hover:text-emerald-200 ${isActive("/matches") ? "font-bold" : ""}`}
                >
                  Matches
                </Link>
              </>
            )}

            <div className="flex items-center gap-4">
              <span className="text-sm">{user?.name}</span>
              <button
                onClick={logout}
                className="bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
