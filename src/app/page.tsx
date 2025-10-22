import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome to Our Store
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Discover amazing products at unbeatable prices. Quality guaranteed with fast shipping.
        </p>
        <div className="space-x-4">
          <Button size="lg" variant="secondary">
            Shop Now
          </Button>
          <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
            Learn More
          </Button>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Categories</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Electronics</CardTitle>
              <CardDescription>Latest gadgets and tech accessories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 h-32 rounded-md mb-4"></div>
              <Badge variant="secondary">New Arrivals</Badge>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/products/electronics">Browse Electronics</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Clothing</CardTitle>
              <CardDescription>Fashion and apparel for everyone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-pink-100 to-pink-200 h-32 rounded-md mb-4"></div>
              <Badge variant="secondary">Trending</Badge>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/products/clothing">Shop Clothing</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Home & Garden</CardTitle>
              <CardDescription>Everything for your home and outdoor spaces</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-green-100 to-green-200 h-32 rounded-md mb-4"></div>
              <Badge variant="secondary">Best Sellers</Badge>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/products/home">Explore Home</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-16 bg-gray-50 rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of satisfied customers. Create an account today and get exclusive access to deals and offers.
        </p>
        <div className="space-x-4">
          <Button size="lg">
            Sign Up Now
          </Button>
          <Button size="lg" variant="outline">
            Continue as Guest
          </Button>
        </div>
      </section>
    </div>
  );
}
