"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@iconify/react';

interface FeaturedPost {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
}

export default function FeaturedStory() {
  const [post, setPost] = useState<FeaturedPost | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Try to fetch a post marked as featured, or just the latest one
        const res = await fetch("/api/client/journal?limit=1");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setPost(data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch featured story:", err);
      }
    };
    fetchFeatured();
  }, []);

  // Default hardcoded content if no post is found
  const displayTitle = post ? post.title : "Crafted for the\nJourney";
  const displayExcerpt = post ? post.excerpt : "We believe in the beauty of the journey. Every scratch, fade, and tear tells a story of where you've been. Our goods are designed to age with you, becoming better with every mile.";
  const displayImage = post ? post.image : "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/5bab247f-35d9-400d-a82b-fd87cfe913d2_1600w.webp";
  const displayLink = post ? `/journal/${post.slug}` : "/journal";

  return (
    <section className="section_featured-story bg-[#1c1a19] text-white">
      <div className="featured-story_grid grid grid-cols-1 lg:grid-cols-2">
        <Link href={displayLink} className="featured-story_image-wrapper h-[400px] lg:h-[700px] relative overflow-hidden order-1 lg:order-2 block">
          <Image 
            src={displayImage} 
            alt="Workshop" 
            fill
            className="object-cover opacity-90 hover:scale-105 transition-transform duration-1000 grayscale-[20%]"
          />
        </Link>
        <div className="featured-story_content flex flex-col justify-center px-5 lg:px-20 py-20 order-2 lg:order-1 border-r border-[#333]">
          <span className="text-[#a58c69] text-xs font-bold uppercase tracking-[0.2em] mb-6">The Journal</span>
          <h2 className="text-4xl lg:text-3xl font-bold uppercase tracking-tight leading-[1.3] mb-8 whitespace-pre-line">
            {displayTitle}
          </h2>
          <p className="text-gray-400 font-light text-sm leading-7 mb-10 max-w-md">
            {displayExcerpt}
          </p>
          <div className="button-wrapper">
            <Link href={displayLink} className="inline-flex items-center gap-4 text-white text-xs font-bold uppercase tracking-widest hover:text-[#a58c69] transition-all group">
              Read the Story 
              <span className="border border-white/30 p-2 rounded-full group-hover:border-[#a58c69] transition-colors">
                <Icon icon="lucide:arrow-right" width="16" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
