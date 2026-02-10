import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  {
    name: 'Neon Strike Sneakers',
    description: 'High-performance sneakers with neon accents. Lightweight design with superior comfort for all-day wear.',
    price: 129.99,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800'
    ],
    category: 'Sneakers',
    inStock: true,
    stockCount: 40
  },
  {
    name: 'Shadow Tech Hoodie',
    description: 'Premium tech-wear hoodie with moisture-wicking fabric. Features hidden pockets and ergonomic design.',
    price: 89.99,
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a4?w=800',
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800'
    ],
    category: 'Hoodies',
    inStock: true,
    stockCount: 65
  },
  {
    name: 'Electric Blue Denim Jacket',
    description: 'Vintage-inspired denim jacket with electric blue wash. Perfect for layering and street style.',
    price: 79.99,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800'
    ],
    category: 'Jackets',
    inStock: true,
    stockCount: 25
  },
  {
    name: 'Cyber Punk T-Shirt',
    description: 'Futuristic graphic tee with glow-in-the-dark prints. Made from organic cotton blend.',
    price: 34.99,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800'
    ],
    category: 'T-Shirts',
    inStock: true,
    stockCount: 80
  },
  {
    name: 'Galaxy Print Joggers',
    description: 'Comfortable joggers with cosmic galaxy print. Elastic waistband and tapered fit.',
    price: 54.99,
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'
    ],
    category: 'Joggers',
    inStock: true,
    stockCount: 55
  },
  {
    name: 'Neon Grid Baseball Cap',
    description: 'Structured baseball cap with neon grid embroidery. Adjustable strap and curved brim.',
    price: 24.99,
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
      'https://images.unsplash.com/photo-1503341960582-b45751874cf0?w=800'
    ],
    category: 'Accessories',
    inStock: true,
    stockCount: 70
  },
  {
    name: 'Holographic Bomber Jacket',
    description: 'Iridescent bomber jacket with holographic finish. Wind-resistant and lightweight.',
    price: 119.99,
    images: [
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800'
    ],
    category: 'Jackets',
    inStock: true,
    stockCount: 20
  },
  {
    name: 'Digital Camo Cargo Shorts',
    description: 'Modern cargo shorts with digital camouflage pattern. Multiple pockets and breathable fabric.',
    price: 44.99,
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800'
    ],
    category: 'Shorts',
    inStock: true,
    stockCount: 45
  },
  {
    name: 'Neon Pulse Backpack',
    description: 'Tech-inspired backpack with LED pulse strips. Laptop compartment and USB charging port.',
    price: 69.99,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
    ],
    category: 'Accessories',
    inStock: true,
    stockCount: 30
  },
  {
    name: 'Cyber Mesh Tank Top',
    description: 'Athletic tank top with cyber mesh panels. Moisture-wicking and ultra-lightweight.',
    price: 29.99,
    images: [
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'
    ],
    category: 'Tank Tops',
    inStock: true,
    stockCount: 60
  }
];

async function seedProducts() {
  console.log('🌱 Seeding products...');

  try {
    // Clear existing products
    await prisma.product.deleteMany({});
    console.log('🗑️ Cleared existing products');

    // Create new products
    for (const productData of products) {
      const product = await prisma.product.create({
        data: productData,
      });
      console.log(`✅ Created product: ${product.name} - $${product.price}`);
    }

    console.log(`🎉 Successfully seeded ${products.length} products!`);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
}

async function main() {
  await seedProducts();
}

main()
  .catch((e) => {
    console.error('❌ Seed script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });