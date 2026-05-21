import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { NotificationProvider } from "@/context/NotificationContext";
import { DevToolsProtection } from "@/components/ui/custom/DevToolsProtection";
import { PWAInstallPrompt } from "@/components/ui/custom/PWAInstallPrompt";
import { PWAUpdateHandler } from "@/components/ui/custom/PWAUpdateHandler";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F4F0" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Delphin Associates",
    template: "%s | Delphin Associates",
  },
  description: "Enterprise Construction Daily Site Monitoring System",
  applicationName: "Delphin Associates",
  manifest: "/manifest.json",
  keywords: ["construction", "site monitoring", "daily reports", "enterprise"],
  authors: [{ name: "Delphin Associates" }],
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Delphin Associates",
    startupImage: [
      {
        url: "/appstore-images/ios/1024.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/appstore-images/ios/512.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/appstore-images/ios/192.png", sizes: "192x192", type: "image/png" },
      { url: "/appstore-images/ios/512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/appstore-images/ios/180.png", sizes: "180x180", type: "image/png" },
      { url: "/appstore-images/ios/152.png", sizes: "152x152", type: "image/png" },
      { url: "/appstore-images/ios/144.png", sizes: "144x144", type: "image/png" },
      { url: "/appstore-images/ios/120.png", sizes: "120x120", type: "image/png" },
      { url: "/appstore-images/ios/114.png", sizes: "114x114", type: "image/png" },
      { url: "/appstore-images/ios/76.png", sizes: "76x76", type: "image/png" },
      { url: "/appstore-images/ios/72.png", sizes: "72x72", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/appstore-images/ios/512.png", color: "#000000" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#000000",
    "msapplication-TileImage": "/appstore-images/ios/144.png",
    "msapplication-tap-highlight": "no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} dark`} suppressHydrationWarning>
      <head>
        {/* PWA — iOS safe area insets for notch / Dynamic Island */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`font-sans bg-background text-foreground antialiased`}>
        <DevToolsProtection />
        <AuthProvider>
          <NotificationProvider>
            {children}
            <Toaster position="bottom-center" theme="dark" />
            <PWAInstallPrompt />
            <PWAUpdateHandler />
          </NotificationProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
