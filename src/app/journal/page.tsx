"use client";

import { useState, useEffect } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

interface JournalPost {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  tag: string;
  date: string;
}

export default function JournalPage() {
  const [journalPosts, setJournalPosts] = useState<JournalPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/client/journal");
        if (res.ok) {
          const data = await res.json();
          setJournalPosts(data);
        }
      } catch (err) {
        console.error("Failed to fetch journal posts:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="page-wrapper flex flex-col min-h-screen bg-white">
      <AnnouncementBar />
      <Navbar />

      <main className="main-wrapper flex-grow">
        <section className="border-b border-[#e5e5e5] bg-[#f8f8f8]">
          <div className="padding-global px-5 lg:px-20">
            <div className="container-large max-w-[1792px] mx-auto py-14 lg:py-20">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#a58c69] mb-4">Journal</p>
              <h1 className="text-4xl lg:text-6xl font-bold uppercase tracking-tight text-[#1c1a19]">
                Stories on Craft, Style, and Movement
              </h1>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="padding-global px-5 lg:px-20">
            <div className="container-large max-w-[1792px] mx-auto">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-pulse font-mono text-xs uppercase tracking-widest text-gray-400">Loading Stories...</div>
                </div>
              ) : journalPosts.length === 0 ? (
                <div className="flex justify-center py-20">
                    <p className="font-mono text-xs uppercase tracking-widest text-gray-400">No stories found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {journalPosts.map((story) => (
                    <Link href={`/journal/${story.slug}`} key={story.slug} className="border border-[#e5e5e5] bg-white flex flex-col group">
                      <div className="relative w-full aspect-[1.1] overflow-hidden bg-[#f0f0f0]">
                        <Image
                          src={story.image}
                          alt={story.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-6 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#a58c69]">{story.tag}</span>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{story.date}</span>
                        </div>
                        <h2 className="text-lg font-bold uppercase tracking-wide text-[#1c1a19] leading-snug">{story.title}</h2>
                        <p className="text-sm font-mono text-gray-600 leading-6 line-clamp-3">{story.excerpt}</p>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#1c1a19] pt-2 group-hover:text-[#a58c69] transition-colors">
                          Read article
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
