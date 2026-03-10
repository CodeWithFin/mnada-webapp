import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import Image from "next/image";

const womensProducts = [
  {
    id: "w1",
    name: "Rider Leather Jacket - Vintage Brown",
    price: 28000,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1935&auto=format&fit=crop",
    isNew: true
  },
  {
    id: "w2",
    name: "Desert Wanderer Boots",
    price: 19500,
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: "w3",
    name: "Selvedge Denim Shorts",
    price: 6800,
    image: "https://images.unsplash.com/photo-1591369822096-11440d4e9fd8?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: "w4",
    name: "Sunset Crop Tee",
    price: 3500,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=2070&auto=format&fit=crop",
  }
];

export default function WomensPage() {
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
