import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import Image from "next/image";

const mensProducts = [
  {
    id: "m1",
    name: "Bucking Bronco Hoodie - Washed Black",
    price: 8000,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop",
    isNew: true
  },
  {
    id: "m2",
    name: "Mechanic Overshirt - Raw Indigo",
    price: 12000,
    image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg",
  },
  {
    id: "m3",
    name: "Wayfarer Cap - Rust Orange",
    price: 3200,
    image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg",
  },
  {
    id: "m4",
    name: "Utility Tote - Olive Canvas",
    price: 8500,
    image: "https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "m5",
    name: "Wilderness Graphic Tee",
    price: 4500,
    image: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1974&auto=format&fit=crop",
    isNew: true
  },
  {
    id: "m6",
    name: "Pioneer Jacket - Moss",
    price: 18000,
    image: "https://images.unsplash.com/photo-1559561853-08451507cbe7?q=80&w=2003&auto=format&fit=crop",
  }
];

export default function MensPage() {
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
