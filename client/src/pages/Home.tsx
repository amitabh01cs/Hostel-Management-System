import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { Helmet } from "react-helmet";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>IIST-IIP-IIMR Hostel Portal</title>
        <meta name="description" content="Welcome to the IIST-IIP-IIMR Hostel Portal. Streamlining hostel services at your fingertips." />
        <meta property="og:title" content="IIST-IIP-IIMR Hostel Portal" />
        <meta property="og:description" content="Access the IIST-IIP-IIMR Hostel Portal for streamlined hostel services and management." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <Header />
      
      {/* Divider */}
      <div className="w-full h-px bg-neutral-300"></div>
      
      <div className="px-6 md:px-12">
        <HeroSection />
      </div>
    </div>
  );
};

export default Home;
