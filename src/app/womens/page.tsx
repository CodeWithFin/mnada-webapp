import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import Image from "next/image";

import { supabase } from "@/lib/supabase";

// Removed hardcoded womensProducts array
export const revalidate = 60; // Revalidate cache every 60 seconds

export default async function WomensPage() {
  const { data: dbProducts, error } = await supabase
    .from('products')
    .select('mock_id, name, price, image, is_new')
    .eq('category', "Women's");
    
  if (error) {
    console.error('Error fetching womens products:', error);
  }

  const womensProducts = dbProducts?.map(p => ({
    id: p.mock_id,
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
            src="https://images.unsplash.com/photo-1642912273231-dfed0c466dc4?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Womens Collection"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-white text-5xl md:text-7xl font-bold uppercase tracking-widest drop-shadow-lg">
              Womens
            </h1>
          </div>
        </header>

        <ProductGrid title="All Womens" products={womensProducts} />
      </main>

      <Footer />
    </div>
  );
}
