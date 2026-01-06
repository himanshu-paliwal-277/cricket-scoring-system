import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Providers } from "@/providers/Providers";
import "./globals.css";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { Notifications } from "@mantine/notifications";

export const metadata: Metadata = {
  title: "Cricket Scoring System",
  description:
    "A web application to manage and score cricket matches efficiently.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cricket Score",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body>
        <Providers>
          <MantineProvider>
            {children}
            <Notifications />
          </MantineProvider>
        </Providers>
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                // Auto-reload when new service worker takes control
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                  console.log('New service worker activated, reloading...');
                  window.location.reload();
                });

                window.addEventListener('load', () => {
                  navigator.serviceWorker
                    .register('/sw.js')
                    .then((registration) => {
                      console.log('Service Worker registered:', registration);

                      // Check for updates every 60 seconds
                      setInterval(() => {
                        registration.update();
                      }, 60000);

                      // Listen for updates
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              console.log('New service worker available');
                              // The new service worker will activate and trigger controllerchange
                            }
                          });
                        }
                      });
                    })
                    .catch((error) => {
                      console.log('Service Worker registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
