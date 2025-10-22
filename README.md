# Ecommerce StoreThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



A modern ecommerce application built with Next.js, Supabase, and shadcn/ui.## Getting Started



## FeaturesFirst, run the development server:



- ✅ Next.js 15 with App Router```bash

- ✅ TypeScriptnpm run dev

- ✅ Tailwind CSS# or

- ✅ Supabase for authentication and databaseyarn dev

- ✅ shadcn/ui components# or

- ✅ Responsive designpnpm dev

- ✅ User authentication (login/signup)# or

bun dev

## Tech Stack```



- **Framework**: Next.js 15Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- **Language**: TypeScript

- **Styling**: Tailwind CSSYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- **UI Components**: shadcn/ui

- **Database**: SupabaseThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

- **Authentication**: Supabase Auth

## Learn More

## Getting Started

To learn more about Next.js, take a look at the following resources:

### Prerequisites

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- Node.js 18+ - [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- npm or yarn

- Supabase accountYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!



### Installation## Deploy on Vercel



1. Clone the repositoryThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

2. Install dependencies:

   ```bashCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase project details:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your project URL and anon key
3. Set up your database tables (you can use the Supabase dashboard or SQL editor)
4. Configure authentication providers in Authentication > Settings if needed

### Database Schema

You'll need to create tables for your ecommerce functionality. Here's a basic schema to get started:

```sql
-- Users table (handled by Supabase Auth)

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cart items table
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

## Project Structure

```
src/
├── app/                  # Next.js app router
│   ├── auth/            # Authentication pages
│   ├── login/           # Login page
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Homepage
├── components/          # React components
│   ├── ui/              # shadcn/ui components
│   ├── header.tsx       # Navigation header
│   └── footer.tsx       # Footer component
├── lib/                 # Utility functions
│   ├── supabase/        # Supabase clients
│   └── utils.ts         # General utilities
└── middleware.ts        # Next.js middleware
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.