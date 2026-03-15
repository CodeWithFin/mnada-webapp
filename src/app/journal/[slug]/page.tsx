import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJournalPostBySlug, journalPosts } from "@/lib/journalPosts";

export function generateStaticParams() {
  return journalPosts.map((post) => ({ slug: post.slug }));
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getJournalPostBySlug(slug);

  if (!post) {
    notFound();
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
                {post.date} • {post.readTime}
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
