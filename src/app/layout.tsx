import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConditionalLayout } from "@/components/conditional-layout";
import { TenantProvider } from "@/lib/contexts/tenant-provider";
import { platformConfig } from "@/lib/config/platform";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: platformConfig.seo.defaultTitle,
  description: platformConfig.seo.description,
  keywords: platformConfig.seo.keywords,
  openGraph: {
    title: platformConfig.seo.defaultTitle,
    description: platformConfig.seo.description,
    siteName: platformConfig.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TenantProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </TenantProvider>
      </body>
    </html>
  );
}
