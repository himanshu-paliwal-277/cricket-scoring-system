"use client";

import { Navbar } from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-[100dvh] sm:bg-gray-50 bg-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
};
