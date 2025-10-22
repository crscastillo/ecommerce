'use client'

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useTenant } from "@/lib/contexts/tenant-context";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { tenant, isLoading } = useTenant();

  // For platform pages (main domain), don't show store header/footer
  // The platform pages will handle their own navigation
  const isPlatformPage = !tenant && !isLoading;

  if (isPlatformPage) {
    // Platform pages (like the new homepage) handle their own layout
    return (
      <div className="min-h-screen">
        <main>
          {children}
        </main>
      </div>
    );
  }

  // Tenant store pages get the store header/footer
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}