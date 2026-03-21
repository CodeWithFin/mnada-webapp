import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";

export const metadata = {
  title: "FAQ | Mnada",
  description: "Find answers to frequently asked questions about Mnada products, shipping, and more.",
};

export default function FaqPage() {
  return (
    <div className="page-wrapper flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />
      
      <main className="main-wrapper flex-grow">
        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}
