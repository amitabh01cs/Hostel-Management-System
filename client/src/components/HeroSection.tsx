import StatisticsDisplay from "./StatisticsDisplay";
import LoginButton from "./LoginButton";
import HostelImagesGallery from "./HostelImagesGallery";

const HeroSection = () => {
  return (
    <section className="py-10 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 pr-0 md:pr-8 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              WELCOME TO<br />IIST-IIP-IIMR<br />HOSTEL PORTAL
            </h1>
            <p className="text-lg text-neutral-700 mb-6">
              Indore Institute of Science & Technology (IIST) is established in the year 2003, is amongst the Top 5 Engineering Colleges of Indore.
            </p>
            <p className="text-lg text-neutral-700 mb-8">
              Streamlining hostel services at your fingertips
            </p>
            
            <LoginButton />
            
            <StatisticsDisplay />
          </div>
          
          <HostelImagesGallery />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
