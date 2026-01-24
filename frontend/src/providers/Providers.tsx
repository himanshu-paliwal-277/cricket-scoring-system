"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import AxiosInstance from "@/utils/axiosInstance";

export function Providers({ children }: { children: React.ReactNode }) {
  // Wake up server as early as possible
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        await AxiosInstance.get("/");
        console.log("Server is ready");
      } catch {
        console.log("Server warming up...");
      }
    };
    wakeUpServer();
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
