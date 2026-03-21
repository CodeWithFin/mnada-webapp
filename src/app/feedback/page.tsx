import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import FeedbackSection from "@/components/FeedbackSection";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Feedback | Mnada",
  description: "Share your shopping experience, delivery feedback, or product requests with Mnada.",
};

export default function FeedbackPage() {
  return (
    <div className="page-wrapper flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />
      
      <main className="main-wrapper flex-grow">
        <div className="py-20 bg-[#f8f8f8]">
          <FeedbackSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
