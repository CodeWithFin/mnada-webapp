import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const dummyUsers = [
  {
    email: 'alex@example.com',
    username: 'alex_street',
    firstName: 'Alex',
    lastName: 'Martinez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bio: 'Streetwear enthusiast | Fashion lover'
  },
  {
    email: 'sarah@example.com',
    username: 'sarah_style',
    firstName: 'Sarah',
    lastName: 'Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    bio: 'Minimalist fashion | Urban style'
  },
  {
    email: 'mike@example.com',
    username: 'mike_urban',
    firstName: 'Mike',
    lastName: 'Johnson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    bio: 'Sneakerhead | Street culture'
  },
  {
    email: 'emma@example.com',
    username: 'emma_fashion',
    firstName: 'Emma',
    lastName: 'Wilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    bio: 'Fashion blogger | Style inspiration'
  },
  {
    email: 'james@example.com',
    username: 'james_cool',
    firstName: 'James',
    lastName: 'Brown',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    bio: 'Streetwear designer | Creative mind'
  }
];

const dummyPosts = [
  {
    email: 'alex@example.com',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a4?w=800',
    caption: 'Just copped this fresh hoodie! 🔥 Perfect for the fall season. #streetwear #fashion'
  },
  {
    email: 'sarah@example.com',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    caption: 'Minimalist vibes today ✨ Sometimes less is more. #minimalist #style'
  },
  {
    email: 'mike@example.com',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    caption: 'New kicks just dropped! These are fire 🔥 #sneakers #sneakerhead'
  },
  {
    email: 'emma@example.com',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
    caption: 'Loving this jacket combo! Perfect for layering. #fashion #ootd'
  },
  {
    email: 'james@example.com',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
    caption: 'Denim on denim? Yes please! Classic never goes out of style. #denim #classic'
  },
  {
    email: 'alex@example.com',
    image: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800',
    caption: 'Graphic tees are my weakness 😍 This one hits different. #graphictee #streetwear'
  },
  {
    email: 'sarah@example.com',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
    caption: 'Clean white sneakers are a must-have! Goes with everything. #sneakers #minimalist'
  },
  {
    email: 'mike@example.com',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
    caption: 'Cap game strong today 🧢 Simple accessories make the outfit. #accessories #style'
  },
  {
    email: 'emma@example.com',
    image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800',
    caption: 'Crop top season! Perfect for layering with jackets. #crop top #fashion'
  },
  {
    email: 'james@example.com',
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800',
    caption: 'Bomber jacket vibes 🎯 This piece is timeless. #bomberjacket #streetwear'
  },
  {
    email: 'alex@example.com',
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
    caption: 'Cargo pants are back! Functional and stylish. #cargopants #urban'
  },
  {
    email: 'sarah@example.com',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    caption: 'Beanie weather is here! Cozy and cute. #beanie #winterfashion'
  },
  {
    email: 'mike@example.com',
    image: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800',
    caption: 'High-top sneakers for the win! Classic design never fails. #hightops #sneakers'
  },
  {
    email: 'emma@example.com',
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800',
    caption: 'Black tee, white sneakers - can\'t go wrong! #classic #style'
  },
  {
    email: 'james@example.com',
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800',
    caption: 'Street style inspiration from the city 🌆 #streetstyle #urban'
  }
];

async function main() {
  console.log('🌱 Seeding database with dummy users and posts...');

  // Create dummy users
  for (const userData of dummyUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (!existingUser) {
      // Generate a simple password hash (not used for passwordless auth, but required by schema)
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: userData.avatar,
          bio: userData.bio
        }
      });
      console.log(`✅ Created user: ${userData.username}`);
    } else {
      console.log(`⏭️  Skipped user: ${userData.username} (already exists)`);
    }
  }

  // Create dummy posts
  for (const postData of dummyPosts) {
    const user = await prisma.user.findUnique({
      where: { email: postData.email }
    });

    if (user) {
      // Check if post already exists (by image URL)
      const existingPost = await prisma.post.findFirst({
        where: {
          userId: user.id,
          image: postData.image
        }
      });

      if (!existingPost) {
        await prisma.post.create({
          data: {
            userId: user.id,
            image: postData.image,
            caption: postData.caption
          }
        });
        console.log(`✅ Created post by ${user.username}`);
      } else {
        console.log(`⏭️  Skipped post (already exists)`);
      }
    } else {
      console.log(`⚠️  User not found for email: ${postData.email}`);
    }
  }

  // Add some likes to posts
  const posts = await prisma.post.findMany({
    include: { user: true }
  });

  const users = await prisma.user.findMany();

  // Add random likes to posts
  for (const post of posts.slice(0, 10)) {
    // Get 2-5 random users to like this post
    const numLikes = Math.floor(Math.random() * 4) + 2;
    const randomUsers = users
      .filter(u => u.id !== post.userId)
      .sort(() => 0.5 - Math.random())
      .slice(0, numLikes);

    for (const user of randomUsers) {
      const existingLike = await prisma.like.findUnique({
        where: {
          postId_userId: {
            postId: post.id,
            userId: user.id
          }
        }
      });

      if (!existingLike) {
        await prisma.like.create({
          data: {
            postId: post.id,
            userId: user.id
          }
        });
      }
    }
  }

  // Add some comments to posts
  const comments = [
    'Love this! 🔥',
    'So clean!',
    'Where did you get this?',
    'This is fire!',
    'Need this in my wardrobe',
    'Perfect fit!',
    'Amazing style',
    'Great choice!',
    'Looking good!',
    'This is dope!'
  ];

  for (const post of posts.slice(0, 8)) {
    // Add 1-3 random comments
    const numComments = Math.floor(Math.random() * 3) + 1;
    const randomUsers = users
      .filter(u => u.id !== post.userId)
      .sort(() => 0.5 - Math.random())
      .slice(0, numComments);

    for (let i = 0; i < randomUsers.length; i++) {
      await prisma.comment.create({
        data: {
          postId: post.id,
          userId: randomUsers[i].id,
          content: comments[Math.floor(Math.random() * comments.length)]
        }
      });
    }
  }

  // Add some follow relationships
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const usersToFollow = users
      .filter(u => u.id !== user.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1); // Follow 1-3 random users

    for (const userToFollow of usersToFollow) {
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: userToFollow.id
          }
        }
      });

      if (!existingFollow) {
        await prisma.follow.create({
          data: {
            followerId: user.id,
            followingId: userToFollow.id
          }
        });
      }
    }
  }

  console.log('✨ Seeding completed!');
  console.log(`📊 Created ${users.length} users`);
  console.log(`📸 Created ${posts.length} posts`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

