import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export const revalidate = 60; // Revalidate cache every 60 seconds

export default async function NewArrivalsPage() {
  const { data: dbProducts, error } = await supabase
    .from('products')
    .select('id, mock_id, name, price, image, is_new, category')
    .neq('category', 'SYSTEM_AUTH')
    .eq('is_new', true)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching new arrivals:', error);
  }

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
        {/* Hero Header */}
        <header className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden bg-[#1c1a19]">
          <Image 
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop"
            alt="New Arrivals"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <span className="text-[#a58c69] text-xs font-bold uppercase tracking-[0.3em] drop-shadow-md">The Latest Drop</span>
            <h1 className="text-white text-5xl md:text-7xl font-bold uppercase tracking-widest drop-shadow-lg text-center px-4">
              New Arrivals
            </h1>
          </div>
        </header>

        <ProductGrid title="Fresh from the Workshop" products={products} />
      </main>

      <Footer />
    </div>
  );
}
