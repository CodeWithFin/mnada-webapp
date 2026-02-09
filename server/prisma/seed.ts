import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dummyProducts = [
  {
    name: 'Streetwear Essentials Hoodie',
    description: 'Premium quality hoodie with comfortable fit. Perfect for everyday wear. Made with 100% cotton blend.',
    price: 49.99,
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a4?w=800',
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800'
    ],
    category: 'Hoodies',
    inStock: true,
    stockCount: 50
  },
  {
    name: 'Classic Black Tee',
    description: 'Minimalist black t-shirt with soft fabric. Versatile and timeless design.',
    price: 24.99,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800'
    ],
    category: 'T-Shirts',
    inStock: true,
    stockCount: 100
  },
  {
    name: 'Urban Street Jacket',
    description: 'Stylish streetwear jacket with modern design. Water-resistant and breathable.',
    price: 89.99,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800'
    ],
    category: 'Jackets',
    inStock: true,
    stockCount: 30
  },
  {
    name: 'Vintage Denim Jeans',
    description: 'Classic fit denim jeans with vintage wash. Comfortable and durable.',
    price: 69.99,
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800'
    ],
    category: 'Jeans',
    inStock: true,
    stockCount: 45
  },
  {
    name: 'Minimalist White Sneakers',
    description: 'Clean white sneakers perfect for any outfit. Comfortable and stylish.',
    price: 79.99,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800'
    ],
    category: 'Shoes',
    inStock: true,
    stockCount: 60
  },
  {
    name: 'Street Style Cap',
    description: 'Adjustable cap with embroidered logo. Perfect for casual streetwear looks.',
    price: 19.99,
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
      'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=800'
    ],
    category: 'Accessories',
    inStock: true,
    stockCount: 75
  },
  {
    name: 'Oversized Graphic Tee',
    description: 'Bold graphic print on comfortable oversized fit. Statement piece for your wardrobe.',
    price: 34.99,
    images: [
      'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800'
    ],
    category: 'T-Shirts',
    inStock: true,
    stockCount: 40
  },
  {
    name: 'Cargo Pants',
    description: 'Functional cargo pants with multiple pockets. Perfect for urban adventures.',
    price: 59.99,
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800'
    ],
    category: 'Pants',
    inStock: true,
    stockCount: 35
  },
  {
    name: 'Wool Beanie',
    description: 'Warm and cozy wool beanie. Perfect for colder days.',
    price: 16.99,
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800'
    ],
    category: 'Accessories',
    inStock: true,
    stockCount: 80
  },
  {
    name: 'Bomber Jacket',
    description: 'Classic bomber jacket with modern twist. Lightweight and versatile.',
    price: 94.99,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800'
    ],
    category: 'Jackets',
    inStock: true,
    stockCount: 25
  },
  {
    name: 'Crop Top',
    description: 'Trendy crop top perfect for layering. Comfortable and stylish.',
    price: 22.99,
    images: [
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800'
    ],
    category: 'T-Shirts',
    inStock: true,
    stockCount: 55
  },
  {
    name: 'High-Top Sneakers',
    description: 'Classic high-top design with premium materials. Comfortable for all-day wear.',
    price: 99.99,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800'
    ],
    category: 'Shoes',
    inStock: true,
    stockCount: 42
  }
];

async function main() {
  console.log('🌱 Seeding database with dummy products...');

  // Clear existing products (optional - comment out if you want to keep existing)
  // await prisma.product.deleteMany({});
  // console.log('Cleared existing products');

  // Create products
  for (const product of dummyProducts) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name }
    });

    if (!existing) {
      await prisma.product.create({
        data: product
      });
      console.log(`✅ Created: ${product.name}`);
    } else {
      console.log(`⏭️  Skipped: ${product.name} (already exists)`);
    }
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

