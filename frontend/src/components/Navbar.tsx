"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Drawer, Button } from "@mantine/core";
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavLinksProps {
  mobile?: boolean;
  isActive: (path: string) => boolean;
  user: any;
  setOpened: (opened: boolean) => void;
}

const NavLinks = ({
  mobile = false,
  isActive,
  user,
  setOpened,
}: NavLinksProps) => (
  <div className={`flex ${mobile ? "flex-col gap-4" : "items-center gap-6"}`}>
    <Link
      href="/dashboard"
      onClick={() => setOpened(false)}
      className={isActive("/dashboard") ? "font-bold" : ""}
    >
      Dashboard
    </Link>

    {user && user?.role !== "player" && (
      <Link
        href="/players"
        onClick={() => setOpened(false)}
        className={isActive("/players") ? "font-bold" : ""}
      >
        Players
      </Link>
    )}

    {user && (
      <Link
        href="/teams"
        onClick={() => setOpened(false)}
        className={isActive("/teams") ? "font-bold" : ""}
      >
        Teams
      </Link>
    )}

    <Link
      href="/matches"
      onClick={() => setOpened(false)}
      className={isActive("/matches") ? "font-bold" : ""}
    >
      Matches
    </Link>

    <Link
      href="/stats"
      onClick={() => setOpened(false)}
      className={isActive("/stats") ? "font-bold" : ""}
    >
      Stats
    </Link>
  </div>
);

export const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [opened, setOpened] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Navbar */}
      <nav className="py-4 bg-emerald-600 px-4 flex items-center justify-between text-white">
        <Link href="/dashboard" className="text-lg font-bold">
          Cricket Scoring
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks isActive={isActive} user={user} setOpened={setOpened} />

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm">{user.name}</span>
              <Button
                size="xs"
                color="dark"
                leftSection={<LogOut size={14} />}
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="xs">Login</Button>
              </Link>
              {/* <Link href="/register">
                <Button size="xs" color="dark">
                  Register
                </Button>
              </Link> */}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpened(true)}
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu size={26} />
        </button>
      </nav>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        // title="Menu"
        padding="md"
        size="75%"
        hiddenFrom="md"
      >
        <NavLinks
          mobile
          isActive={isActive}
          user={user}
          setOpened={setOpened}
        />

        {user ? (
          <div className="mt-8">
            <p className="text-sm mb-3">{user.name}</p>

            <Button
              fullWidth
              color="red"
              leftSection={<LogOut size={16} />}
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/login" onClick={() => setOpened(false)}>
              <Button fullWidth variant="outline">
                Login
              </Button>
            </Link>
            <Link href="/register" onClick={() => setOpened(false)}>
              <Button fullWidth color="dark">
                Register
              </Button>
            </Link>
          </div>
        )}
      </Drawer>
    </>
  );
};
