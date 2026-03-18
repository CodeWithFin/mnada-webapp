"use client";

import { useState, useEffect } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";

interface JournalPost {
  title: string;
  excerpt: string;
  image: string;
  tag: string;
  date: string;
  read_time: string;
  content: string[];
}

export default function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [post, setPost] = useState<JournalPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/client/journal?slug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
        }
      } catch (err) {
        console.error("Failed to fetch journal post:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="page-wrapper flex flex-col min-h-screen bg-white">
        <AnnouncementBar />
        <Navbar />
        <main className="main-wrapper flex-grow flex items-center justify-center py-20">
          <div className="animate-pulse font-mono text-xs uppercase tracking-widest text-gray-400">Loading Story...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="page-wrapper flex flex-col min-h-screen bg-white">
        <AnnouncementBar />
        <Navbar />
        <main className="main-wrapper flex-grow flex flex-col items-center justify-center py-20 gap-4">
          <p className="font-mono text-xs uppercase tracking-widest text-gray-400">Story not found</p>
          <Link href="/journal" className="text-xs font-bold uppercase tracking-widest underline underline-offset-4">Back to Journal</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper flex flex-col min-h-screen bg-white">
      <AnnouncementBar />
      <Navbar />

      <main className="main-wrapper flex-grow">
        <section className="border-b border-[#e5e5e5] bg-[#f8f8f8]">
          <div className="padding-global px-5 lg:px-20">
            <div className="container-large max-w-[1792px] mx-auto py-10 lg:py-14">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-gray-500 mb-5">
                <Link href="/" className="hover:text-[#1c1a19] transition-colors">Home</Link>
                <span>/</span>
                <Link href="/journal" className="hover:text-[#1c1a19] transition-colors">Journal</Link>
                <span>/</span>
                <span className="text-[#1c1a19]">{post.tag}</span>
              </div>

              <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#a58c69] mb-3">{post.tag}</p>
              <h1 className="text-3xl lg:text-5xl font-bold uppercase tracking-tight text-[#1c1a19] max-w-5xl">
                {post.title}
              </h1>
              <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mt-4">
                {post.date} • {post.read_time}
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className="padding-global px-5 lg:px-20">
            <div className="container-large max-w-[1000px] mx-auto flex flex-col gap-8">
              <div className="relative w-full aspect-[1.6] bg-[#f0f0f0] overflow-hidden border border-[#e5e5e5]">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 1000px"
                  priority
                />
              </div>

              <article className="flex flex-col gap-6">
                {post.content.map((paragraph, index) => (
                  <p key={index} className="text-base lg:text-lg font-mono text-[#1c1a19] leading-9">
                    {paragraph}
                  </p>
                ))}
              </article>

              <div className="pt-4 border-t border-[#e5e5e5]">
                <Link
                  href="/journal"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1c1a19] hover:text-[#a58c69] transition-colors"
                >
                  Back to Journal
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
