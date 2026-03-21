import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import ShippingSection from "@/components/ShippingSection";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Shipping & Delivery | Mnada",
  description: "Learn about our shipping options and delivery times. We offer standard and express delivery across Kenya.",
};

export default function ShippingPage() {
  return (
    <div className="page-wrapper flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />
      
      <main className="main-wrapper flex-grow">
        <ShippingSection />
      </main>

      <Footer />
    </div>
  );
}
