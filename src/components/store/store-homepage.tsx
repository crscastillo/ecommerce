'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { getCategories, getProducts, type Category, type Product } from "@/lib/services/api";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const t = useTranslations();

  const storeName = tenant?.name || t('store.defaultStoreName');
  const storeDescription = tenant?.description || t('store.defaultDescription');

  // Hero background config
  const heroType = tenant?.theme_config?.hero_background_type || 'color';
  const heroValue = tenant?.theme_config?.hero_background_value || '';

  useEffect(() => {
    async function fetchData() {
      if (!tenant?.id) {
        console.log('StoreHomepage: No tenant ID available:', tenant);
        setLoading(false);
        setProductsLoading(false);
        return;
      }

      // Fetch categories and products in parallel
      try {
        const [categoriesResult, productsResult] = await Promise.all([
          getCategories(tenant.id, { is_active: true, limit: 6 }),
          getProducts(tenant.id, { 
            is_active: true, 
            is_featured: true, 
            limit: 8,
            sort_by: 'newest'
          })
        ]);
        
        if (categoriesResult.error) {
          console.error('StoreHomepage: Categories API error:', categoriesResult.error);
        } else {
          console.log('StoreHomepage: Categories fetched successfully, count:', categoriesResult.data?.length);
          setCategories(categoriesResult.data || []);
        }

        if (productsResult.error) {
          console.error('StoreHomepage: Products API error:', productsResult.error);
        } else {
          console.log('StoreHomepage: Products fetched successfully, count:', productsResult.data?.length);
          setProducts(productsResult.data || []);
        }
      } catch (error) {
        console.error('StoreHomepage: Error fetching data:', error);
      } finally {
        setLoading(false);
        setProductsLoading(false);
      }
    }

    fetchData();
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
      <section
        className={`text-center py-20 rounded-lg mb-12 ${heroType === 'color' ? 'text-white' : ''}`}
        style={
          heroType === 'image'
            ? {
                backgroundImage: heroValue ? `url(${heroValue})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#fff',
              }
            : heroValue
              ? { background: heroValue, color: '#fff' }
              : { background: 'linear-gradient(to right, #2563eb, #9333ea)', color: '#fff' }
        }
      >
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

      {/* Top Products Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          {t('store.topProducts')}
        </h2>
        
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="bg-gray-200 h-48 rounded-md mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {products.slice(0, 8).map((product) => {
              const productImage = product.images?.[0] || null;
              const hasDiscount = product.compare_price && product.compare_price > product.price;
              const discountPercentage = hasDiscount 
                ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
                : 0;

              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow group">
                  <CardContent className="p-4">
                    <div className="relative h-48 rounded-md mb-4 overflow-hidden bg-gray-100">
                      {productImage ? (
                        <Image
                          src={productImage}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                          <span className="text-gray-400 text-sm">{t('store.noImage')}</span>
                        </div>
                      )}
                      {hasDiscount && (
                        <Badge className="absolute top-2 right-2 bg-red-500">
                          -{discountPercentage}%
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-lg">
                        ${product.price.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.compare_price!.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Button size="sm" className="w-full" asChild>
                      <Link href={`/products/${product.slug}`}>
                        {t('store.viewProduct')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-8">
              {t('store.noFeaturedProducts')}
            </p>
            <Button asChild variant="outline">
              <Link href="/products">{t('store.viewAllProducts')}</Link>
            </Button>
          </div>
        )}
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
                    <div className="relative h-32 rounded-md mb-4 overflow-hidden">
                      {category.image_url ? (
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className={`bg-gradient-to-br ${colorScheme.bg} w-full h-full`}></div>
                      )}
                    </div>
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