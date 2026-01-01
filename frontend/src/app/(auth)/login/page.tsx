"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Home } from "lucide-react";

export default function LoginPage() {
  const { login, loginLoading, loginError } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-[100dvh] relative flex items-center justify-center bg-gray-50">
      <Link href="/dashboard" className="absolute top-5 left-5">
        <Home size={20} />
      </Link>
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        {loginError && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {(loginError as any)?.response?.data?.message || "Login failed"}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <Button type="submit" className="w-full" isLoading={loginLoading}>
            Login
          </Button>
        </form>

        {/* <p className="text-center mt-4 text-gray-600">
          {`Don't have an account?`}{" "}
          <Link href="/register" className="text-emerald-600 hover:underline">
            Register
          </Link>
        </p> */}
      </Card>
    </div>
  );
}
