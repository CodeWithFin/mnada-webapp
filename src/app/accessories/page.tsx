import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import Image from "next/image";

import { supabase } from "@/lib/supabase";

export const revalidate = 60; // Revalidate cache every 60 seconds

export default async function AccessoriesPage() {
  const { data: dbProducts, error } = await supabase
    .from('products')
    .select('id, mock_id, name, price, image, is_new, category')
    .neq('category', 'SYSTEM_AUTH')
    .eq('category', 'accessories');
    
  if (error) {
    console.error('Error fetching accessories products:', error);
  }

  // Map purely to ensure frontend components get expected ID format
  const accessoriesProducts = dbProducts?.map(p => ({
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
          <Image 
            src="https://images.unsplash.com/photo-1576053139778-7e32f2ae3cf4?q=80&w=2070&auto=format&fit=crop"
            alt="Accessories Collection"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-white text-5xl md:text-7xl font-bold uppercase tracking-widest drop-shadow-lg">
              Accessories
            </h1>
          </div>
        </header>

        <ProductGrid title="All Accessories" products={accessoriesProducts} />
      </main>

      <Footer />
    </div>
  );
}
