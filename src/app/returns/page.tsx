import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import ReturnsSection from "@/components/ReturnsSection";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Returns & Exchanges | Mnada",
  description: "Learn about our return and exchange policy. We offer a 30-day return window for unworn items in original packaging.",
};

export default function ReturnsPage() {
  return (
    <div className="page-wrapper flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />
      
      <main className="main-wrapper flex-grow">
        <ReturnsSection />
      </main>

      <Footer />
    </div>
  );
}
