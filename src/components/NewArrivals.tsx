"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Product type matching the component's needs
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  isNew?: boolean;
}

const PRODUCT_PLACEHOLDER = '/assets/hero-image/product-placeholder.svg';
const ALLOWED_IMAGE_HOSTS = new Set([
  'images.unsplash.com',
  'hoirqrkdgbmvpwutwuwj.supabase.co',
  'dzgprvaijyrwprpaytht.supabase.co',
  'rfqssdpejawljioljrvw.supabase.co',
  'via.placeholder.com'
]);

function getSafeProductImageSrc(rawSrc: string) {
  if (!rawSrc) {
    return PRODUCT_PLACEHOLDER;
  }

  if (rawSrc.startsWith('/')) {
    return rawSrc;
  }

  try {
    const parsed = new URL(rawSrc);
    if (parsed.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.has(parsed.hostname)) {
      return rawSrc;
    }
  } catch {
    return PRODUCT_PLACEHOLDER;
  }

  return PRODUCT_PLACEHOLDER;
}

function normalizeCategory(value: string) {
  return value.toLowerCase().trim();
}

export default function NewArrivals() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories first
        const catRes = await fetch('/api/admin/categories');
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.filter((c: any) => c.name !== 'SYSTEM_AUTH'));
        }

        // Fetch products
        const { data, error } = await supabase
          .from('products')
          .select('id, mock_id, name, price, image, category, is_new')
          .neq('category', 'SYSTEM_AUTH')
          .order('created_at', { ascending: false })
          .limit(100);
          
        if (data && !error) {
          setProducts(data.map(p => ({
            id: p.mock_id || p.id,
            name: p.name,
            price: Number(p.price),
            image: p.image,
            category: p.category,
            isNew: p.is_new
          })));
        }
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  const filteredProducts = products.filter(product => {
    if (activeTab === "all") return true;
    return normalizeCategory(product.category) === normalizeCategory(activeTab);
  });

  const handleQuickAdd = (product: Product) => {
    setAddingId(product.id);
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      size: "L" // Default size for quick add
    });
    setTimeout(() => setAddingId(null), 800);
  };

  return (
    <section className="section_new-arrivals bg-white">
      <div className="padding-global px-5 lg:px-20">
        <div className="container-large max-w-[1792px] mx-auto">
          <div className="padding-section-medium py-12">
            
            {/* Header Component */}
            <div className="new-arrivals_header flex flex-row flex-nowrap justify-between items-center border-t border-[#1c1a19] pt-7 pb-7 lg:pl-[34px] lg:pr-[34px] mb-0 w-full">
              <h3 className="font-mono text-base font-light text-[#1c1a19]">
                New Arrivals
              </h3>
              <div className="new-arrivals_tabs flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                <button 
                  onClick={() => setActiveTab("all")}
                  className={`px-5 py-2 text-sm font-mono border rounded-none transition-all whitespace-nowrap ${
                    activeTab === "all" 
                      ? "border-[#1c1a19] bg-[#1c1a19] text-white hover:opacity-90" 
                      : "border-[#e5e5e5] text-[#1c1a19] bg-transparent hover:border-[#1c1a19]"
                  }`}
                  type="button"
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => setActiveTab(cat.slug)}
                    className={`px-5 py-2 text-sm font-mono border rounded-none transition-all whitespace-nowrap ${
                      activeTab === cat.slug
                        ? "border-[#1c1a19] bg-[#1c1a19] text-white hover:opacity-90" 
                        : "border-[#e5e5e5] text-[#1c1a19] bg-transparent hover:border-[#1c1a19]"
                    }`}
                    type="button"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider List Wrapper */}
            <div className="new-arrivals_list flex overflow-x-auto snap-x snap-mandatory gap-5 pb-8 lg:grid lg:grid-cols-4 lg:gap-5 scrollbar-hide pt-8 min-h-[300px]">
              
              {isLoading ? (
                <div className="col-span-4 py-20 text-center font-mono text-gray-400 uppercase tracking-widest text-sm w-full animate-pulse">
                  Loading Products...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-4 py-20 text-center font-mono text-gray-400 uppercase tracking-widest text-sm w-full">
                  No products found in this category.
                </div>
              ) : (
                filteredProducts.map((product) => (
                <div key={product.id} className="new-arrivals_item snap-start shrink-0 w-[85vw] sm:w-[45vw] lg:w-auto flex flex-col group min-w-0">
                  <Link href={`/product/${product.id}`} className="product_image-wrapper relative aspect-[0.8] bg-[#f8f8f8] overflow-hidden mb-0 block">
                    {product.isNew && (
                      <span className="absolute top-4 left-4 bg-[#a58c69] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 z-10 transition-transform group-hover:scale-110">New</span>
                    )}
                    <Image 
                      src={getSafeProductImageSrc(product.image)}
                      alt={product.name} 
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </Link>
                  <div className="product_content bg-[#fafafa] p-[16px_10px] flex flex-col gap-[10px] w-full border border-transparent group-hover:bg-white group-hover:border-[#f0f0f0] transition-all duration-300">
                    <Link href={`/product/${product.id}`} className="block hover:text-[#a58c69] transition-colors">
                      <h3 className="font-mono text-base font-light leading-5 text-[#1c1a19] line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex justify-between items-center w-full">
                      <div className="font-mono text-base font-light text-[#1c1a19]">KSh {product.price.toFixed(2)}</div>
                      <button 
                        onClick={() => handleQuickAdd(product)}
                        disabled={addingId === product.id}
                        type="button" 
                        className={`font-mono text-base font-light underline decoration-1 underline-offset-4 uppercase transition-all duration-300 flex items-center gap-2 ${addingId === product.id ? 'text-[#a58c69] no-underline' : 'text-[#1c1a19] hover:text-[#a58c69]'}`}
                      >
                        {addingId === product.id ? (
                          <Icon icon="lucide:check" width="16" className="animate-in zoom-in duration-300" />
                        ) : "+ ADD"}
                      </button>
                    </div>
                  </div>
                </div>
              )))}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
