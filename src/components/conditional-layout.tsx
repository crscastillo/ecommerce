'use client'

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useTenant } from "@/lib/contexts/tenant-context";
import { getCategories, type Category } from "@/lib/services/api";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { tenant, isLoading } = useTenant();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);

  // Check if current path is an admin route
  const isAdminRoute = pathname?.startsWith('/admin');

  // Fetch categories for footer
  useEffect(() => {
    async function fetchCategories() {
      if (!tenant?.id) return;
      
      try {
        const result = await getCategories(tenant.id, { is_active: true, limit: 10 });
        if (!result.error) {
          setCategories(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories for footer:', error);
      }
    }

    fetchCategories();
  }, [tenant?.id]);

  // For platform pages (main domain), don't show store header/footer
  // The platform pages will handle their own navigation
  const isPlatformPage = !tenant && !isLoading;

  // Admin routes should not have the main site header/footer
  if (isAdminRoute) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

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
      <Footer categories={categories} />
    </div>
  );
}