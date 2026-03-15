import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import Image from "next/image";

import { supabase } from "@/lib/supabase";

// Removed hardcoded mensProducts array
export const revalidate = 60; // Revalidate cache every 60 seconds

export default async function MensPage() {
  const { data: dbProducts, error } = await supabase
    .from('products')
    .select('id, mock_id, name, price, image, is_new, category')
    .neq('category', 'SYSTEM_AUTH')
    .eq('category', 'men');
    
  if (error) {
    console.error('Error fetching mens products:', error);
  }

  // Map purely to ensure frontend components get expected ID format
  const mensProducts = dbProducts?.map(p => ({
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
            src="https://images.unsplash.com/photo-1630922199795-e40a1cff7f88?q=80&w=2037&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Mens Collection"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-white text-5xl md:text-7xl font-bold uppercase tracking-widest drop-shadow-lg">
              Mens
            </h1>
          </div>
        </header>

        <ProductGrid title="All Mens" products={mensProducts} />
      </main>

      <Footer />
    </div>
  );
}
