import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Collections from "@/components/Collections";
import NewArrivals from "@/components/NewArrivals";
import FeaturedStory from "@/components/FeaturedStory";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="page-wrapper flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />
      
      <main className="main-wrapper">
        <Hero />
        <Marquee />
        <Collections />
        <NewArrivals />
        <FeaturedStory />
        <Newsletter />
      </main>

      <Footer />
    </div>
  );
}
