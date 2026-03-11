import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  isNew?: boolean;
}

interface ProductGridProps {
  title: string;
  products: Product[];
}

export default function ProductGrid({ title, products }: ProductGridProps) {
  return (
    <section className="section_product-grid bg-white pt-10 pb-20">
      <div className="padding-global px-5 lg:px-20">
        <div className="container-large max-w-[1792px] mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-[#1c1a19] pb-4">
            <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight text-[#1c1a19]">
              {title}
            </h1>
            <div className="text-xs font-mono text-[#666] tracking-widest uppercase mt-4 md:mt-0">
              {products.length} Products
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {products.map((product) => (
              <div key={product.id} className="product-card flex flex-col group">
                <Link href={`/product/${product.id}`} className="product_image-wrapper relative aspect-[0.8] bg-[#f8f8f8] overflow-hidden mb-0 block">
                  {product.isNew && (
                    <span className="absolute top-4 left-4 bg-[#a58c69] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 z-10">
                      New
                    </span>
                  )}
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="product_content bg-[#fafafa] p-[16px_10px] flex flex-col gap-[10px] w-full">
                  <Link href={`/product/${product.id}`} className="block hover:text-[#a58c69] transition-colors">
                    <h3 className="font-mono text-xs md:text-sm font-light leading-5 text-[#1c1a19]">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex justify-between items-center w-full">
                    <div className="font-mono text-xs md:text-sm font-light text-[#1c1a19]">KSh {product.price.toFixed(2)}</div>
                    <Link href={`/product/${product.id}`} className="font-mono text-[10px] md:text-xs font-light text-[#1c1a19] underline decoration-1 underline-offset-4 uppercase hover:text-[#a58c69] transition-colors">
                      + ADD
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
