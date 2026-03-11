"use client";

import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { use, useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";

interface ProductDetails {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  materials: string;
  fit: string;
  sizes: string[];
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('mock_id', id)
        .single();

      if (data && !error) {
        let galleryImages = [data.image];
        let cleanDescription = data.description || "";

        if (data.description && data.description.includes("---GALLERY_DATA---")) {
          const parts = data.description.split("---GALLERY_DATA---");
          cleanDescription = parts[0].trim();
          try {
            galleryImages = JSON.parse(parts[1]);
          } catch (e) {
            console.error("Error parsing gallery data:", e);
          }
        }

        setProduct({
          id: data.mock_id,
          name: data.name,
          price: Number(data.price),
          description: cleanDescription || "No description provided.",
          images: galleryImages, 
          materials: data.materials || "Premium materials.",
          fit: data.fit || "True to size.",
          sizes: data.sizes || ['S', 'M', 'L', 'XL']
        });
      }
      setIsLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    setIsAdding(true);
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      size: selectedSize
    });
    
    // Reset loading state after a brief delay
    setTimeout(() => {
      setIsAdding(false);
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="page-wrapper flex flex-col min-h-screen bg-white items-center justify-center">
        <div className="animate-pulse font-mono text-sm uppercase tracking-widest text-gray-400">Loading Product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-wrapper flex flex-col min-h-screen bg-white items-center justify-center gap-6">
        <h2 className="text-xl font-mono uppercase tracking-widest text-[#1c1a19]">Product not found</h2>
        <Link href="/mens" className="px-8 h-12 bg-[#1c1a19] text-white flex items-center justify-center text-xs font-bold uppercase tracking-widest hover:bg-[#a58c69] transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper flex flex-col min-h-screen bg-white">
      <AnnouncementBar />
      <Navbar />
      
      <main className="main-wrapper flex-grow">
        
        {/* Breadcrumbs */}
        <div className="padding-global px-5 lg:px-20 py-4 border-b border-[#f0f0f0]">
          <div className="container-large max-w-[1792px] mx-auto flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-[#666]">
            <Link href="/" className="hover:text-[#1c1a19] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/mens" className="hover:text-[#1c1a19] transition-colors">Mens</Link>
            <span>/</span>
            <span className="text-[#1c1a19]">{product.name}</span>
          </div>
        </div>

        {/* Product Layout */}
        <div className="padding-global px-5 lg:px-20 py-10 lg:py-16">
          <div className="container-large max-w-[1792px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
              
              {/* Product Images (Left) */}
              <div className="lg:col-span-7 flex flex-col items-center">
                <div className="w-full xl:w-[70%] flex flex-col gap-4">
                  
                  <div className="flex items-center w-full gap-2 md:gap-4">
                    {/* Left Arrow */}
                    {product.images.length > 1 && (
                      <button 
                        onClick={() => setActiveImage(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                        className="shrink-0 bg-white text-[#1c1a19] w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-[#e5e5e5] hover:border-[#1c1a19] transition-colors"
                      >
                        <Icon icon="lucide:chevron-left" width="20" />
                      </button>
                    )}

                    {/* Main Image Carousel */}
                    <div className="relative w-full aspect-[0.8] bg-[#f8f8f8] overflow-hidden">
                      <Image 
                        src={product.images[activeImage]}
                        alt={`${product.name} Image ${activeImage + 1}`}
                        fill
                        className="object-cover transition-opacity duration-300"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                      />
                    </div>
                    
                    {/* Right Arrow */}
                    {product.images.length > 1 && (
                      <button 
                        onClick={() => setActiveImage(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                        className="shrink-0 bg-white text-[#1c1a19] w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-[#e5e5e5] hover:border-[#1c1a19] transition-colors"
                      >
                        <Icon icon="lucide:chevron-right" width="20" />
                      </button>
                    )}
                  </div>

                  {/* Thumbnail Previews */}
                  {product.images.length > 1 && (
                    <div className="flex justify-center gap-2 w-full overflow-x-auto scrollbar-hide snap-x">
                      {product.images.map((img, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setActiveImage(idx)}
                          className={`relative w-16 md:w-20 aspect-[0.8] bg-[#f8f8f8] shrink-0 snap-start transition-all ${activeImage === idx ? 'ring-1 ring-[#1c1a19] opacity-100' : 'opacity-50 hover:opacity-100'}`}
                        >
                          <Image 
                            src={img}
                            alt={`${product.name} Preview ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details (Right - Sticky) */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-8">
                
                <div className="flex flex-col gap-4">
                  <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#1c1a19] leading-[1.1]">
                    {product.name}
                  </h1>
                  <div className="text-xl font-mono font-light text-[#1c1a19]">
                    KSh {product.price.toFixed(2)}
                  </div>
                </div>

                {/* Size Selector */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs font-mono uppercase tracking-widest text-[#1c1a19]">
                    <span>Select Size</span>
                    <button className="underline decoration-1 underline-offset-4 text-[#a58c69]">Size Guide</button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {product.sizes.map((size) => (
                      <button 
                        key={size} 
                        onClick={() => setSelectedSize(size)}
                        className={`h-12 border flex items-center justify-center text-sm font-mono transition-colors ${selectedSize === size ? 'border-[#1c1a19] bg-[#1c1a19] text-white' : 'border-[#e5e5e5] bg-white hover:border-[#1c1a19] hover:bg-[#fafafa]'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add to Cart */}
                <button 
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`w-full h-14 font-bold uppercase text-[11px] tracking-widest transition-colors flex items-center justify-center gap-3 ${isAdding ? 'bg-[#a58c69] text-white cursor-default' : 'bg-[#1c1a19] text-white hover:bg-[#a58c69]'}`}
                >
                  <Icon icon={isAdding ? "lucide:check" : "lucide:shopping-bag"} width={16} className={isAdding ? "animate-in zoom-in duration-300" : ""} />
                  {isAdding ? "Added to Cart" : "Add to Cart"}
                </button>

                {/* Product Info Accordions */}
                <div className="border-t border-[#e5e5e5] mt-4">
                  
                  <details className="group border-b border-[#e5e5e5]" open>
                    <summary className="flex justify-between items-center py-5 cursor-pointer list-none text-xs font-bold uppercase tracking-widest text-[#1c1a19]">
                      Description
                      <span className="transition group-open:rotate-180">
                        <Icon icon="lucide:chevron-down" width="16" />
                      </span>
                    </summary>
                    <div className="pb-5 text-sm font-light text-gray-500 leading-relaxed font-mono">
                      {product.description}
                    </div>
                  </details>

                  <details className="group border-b border-[#e5e5e5]">
                    <summary className="flex justify-between items-center py-5 cursor-pointer list-none text-xs font-bold uppercase tracking-widest text-[#1c1a19]">
                      Materials & Care
                      <span className="transition group-open:rotate-180">
                        <Icon icon="lucide:chevron-down" width="16" />
                      </span>
                    </summary>
                    <div className="pb-5 text-sm font-light text-gray-500 leading-relaxed font-mono">
                      {product.materials}
                    </div>
                  </details>

                  <details className="group border-b border-[#e5e5e5]">
                    <summary className="flex justify-between items-center py-5 cursor-pointer list-none text-xs font-bold uppercase tracking-widest text-[#1c1a19]">
                      Shipping & Returns
                      <span className="transition group-open:rotate-180">
                        <Icon icon="lucide:chevron-down" width="16" />
                      </span>
                    </summary>
                    <div className="pb-5 text-sm font-light text-gray-500 leading-relaxed font-mono">
                      Free shipping on orders over KSh 15000. Returns accepted within 30 days of purchase for unworn items in original packaging.
                    </div>
                  </details>

                </div>

              </div>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
