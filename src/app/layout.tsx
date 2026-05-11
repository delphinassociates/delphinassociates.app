import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const viewport = {
  themeColor: '#D4AF37',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Delphin Associates app",
  description: "Enterprise Construction Daily Site Monitoring System",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Delphin App',
  },
  icons: {
    apple: '/icon-square.png',
  }
};

import { NotificationProvider } from "@/context/NotificationContext";
import { DevToolsProtection } from "@/components/ui/custom/DevToolsProtection";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} dark`}>
      <body className={`font-sans bg-background text-foreground antialiased`}>
        <DevToolsProtection />
        <AuthProvider>
          <NotificationProvider>
            {children}
            <Toaster position="top-right" theme="dark" />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
