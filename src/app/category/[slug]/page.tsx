import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const revalidate = 60; // Revalidate cache every 60 seconds

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;

  // 1. Fetch Category Details
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (catError || !category) {
    // If not found in categories table, could be a legacy route or error
    return notFound();
  }

  // 2. Fetch Products for this Category
  // Note: We'll match against the category name or slug in the products table
  // Depending on how products are tagged, we might need to be flexible.
  // Standardizing on category name for now.
  const { data: dbProducts, error: prodError } = await supabase
    .from('products')
    .select('id, mock_id, name, price, image, is_new, category')
    .neq('category', 'SYSTEM_AUTH')
    .ilike('category', `%${category.slug}%`); // or category.name
    
  if (prodError) {
    console.error('Error fetching category products:', prodError);
  }

  // Map to frontend component format
  const products = dbProducts?.map(p => ({
    id: p.mock_id || p.id,
    name: p.name,
    price: Number(p.price),
    image: p.image,
    isNew: p.is_new
  })) || [];

  return (
    <div className="page-wrapper flex flex-col min-h-screen bg-white">
      <AnnouncementBar />
      <Navbar />
      
      <main className="main-wrapper flex-grow">
        {/* Category Header */}
        <header className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden bg-[#1c1a19]">
          {category.hero_image_url && (
            <Image 
              src={category.hero_image_url}
              alt={category.name}
              fill
              className="object-cover opacity-60"
              priority
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-white text-5xl md:text-7xl font-bold uppercase tracking-widest drop-shadow-lg text-center px-4">
              {category.name}
            </h1>
          </div>
        </header>

        <ProductGrid title={`All ${category.name}`} products={products} />
      </main>

      <Footer />
    </div>
  );
}
