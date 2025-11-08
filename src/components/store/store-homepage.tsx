'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getCategories, type Category } from "@/lib/services/api";

interface StoreHomepageProps {
  tenant?: {
    id: string;
    name: string;
    description?: string;
    theme_config?: Record<string, any>;
  };
}

export default function StoreHomepage({ tenant }: StoreHomepageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations();
  
  const storeName = tenant?.name || t('store.defaultStoreName');
  const storeDescription = tenant?.description || t('store.defaultDescription');

  useEffect(() => {
    async function fetchCategories() {
      console.log('StoreHomepage: fetchCategories called with tenant:', tenant);
      
      if (!tenant?.id) {
        console.log('StoreHomepage: No tenant ID available:', tenant);
        setLoading(false);
        return;
      }

      try {
        console.log('StoreHomepage: Fetching categories via API service for tenant:', tenant.id);
        
        const result = await getCategories(tenant.id, { is_active: true, limit: 6 });
        console.log('StoreHomepage: API service response:', result);
        
        if (result.error) {
          console.error('StoreHomepage: API service returned error:', result.error);
          throw new Error(result.error);
        } else {
          console.log('StoreHomepage: Categories fetched successfully, count:', result.data?.length);
          setCategories(result.data || []);
        }
      } catch (error) {
        console.error('StoreHomepage: Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [tenant?.id]);

  // Predefined color schemes for categories
  const colorSchemes = [
    { bg: 'from-blue-100 to-blue-200', badge: t('store.newArrivals') },
    { bg: 'from-pink-100 to-pink-200', badge: t('store.trending') },
    { bg: 'from-green-100 to-green-200', badge: t('store.bestSellers') },
    { bg: 'from-purple-100 to-purple-200', badge: t('store.featured') },
    { bg: 'from-orange-100 to-orange-200', badge: t('store.popular') },
    { bg: 'from-indigo-100 to-indigo-200', badge: t('store.hotDeals') },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          {t('store.welcomeTo', { storeName })}
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          {storeDescription}
        </p>
        <div className="space-x-4">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/products">{t('store.shopNow')}</Link>
          </Button>
          <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
            {t('common.learnMore')}
          </Button>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          {categories.length > 0 ? t('store.featuredCategories') : t('store.ourStore')}
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow w-full max-w-sm">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-200 h-32 rounded-md mb-4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className={`grid gap-6 justify-items-center ${
            categories.length === 1 
              ? 'grid-cols-1 max-w-md mx-auto' 
              : categories.length === 2 
                ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {categories.map((category, index) => {
              const colorScheme = colorSchemes[index % colorSchemes.length];
              return (
                <Card key={category.id} className="hover:shadow-lg transition-shadow w-full max-w-sm">
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>
                      {category.description || t('store.exploreCollection', { categoryName: category.name.toLowerCase() })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`bg-gradient-to-br ${colorScheme.bg} h-32 rounded-md mb-4`}></div>
                    <Badge variant="secondary">{colorScheme.badge}</Badge>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/products/category/${category.slug}`}>
                        {t('store.browseCategory', { categoryName: category.name })}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-8">
              {t('store.storeBeingSetup')}
            </p>
            <Button asChild variant="outline">
              <Link href="/products">{t('store.viewAllProducts')}</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="text-center py-16 bg-gray-50 rounded-lg">
        <h2 className="text-3xl font-bold mb-4">{t('store.readyToStartShopping')}</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          {t('store.joinCustomers')}
        </p>
        <div className="space-x-4">
          <Button size="lg" asChild>
            <Link href="/signup">{t('auth.signUpNow')}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/products">{t('store.continueAsGuest')}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}