import campusImage from "../assets/campus.jpg";
import  Img from "../assets/iistind.png";
import  ImgC from "../assets/iipind.png";
import  ImgD from "../assets/iimrind.png";



const HostelImagesGallery = () => {
  return (
    <div className="w-full md:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="relative rounded-lg overflow-hidden">
        <img 
          src={Img} 
          alt="IIST" 
          className="w-full h-56 object-cover shadow-lg transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-0 right-0 bg-black p-1 rounded-bl-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
          </svg>
        </div>
      </div>
      
      <div className="relative rounded-lg overflow-hidden border-2 border-primary-blue">
        <img 
          src={ImgC} 
          alt="IIP" 
          className="w-full h-56 object-cover shadow-lg transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-0 right-0 bg-primary-blue p-1 rounded-bl-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
          </svg>
        </div>
      </div>
      
      <div className="relative col-span-1 md:col-span-2 rounded-lg overflow-hidden">
        <img 
          src={ImgD} 
          alt="IIMR" 
          className="w-full h-60 object-cover shadow-lg transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute bottom-0 right-0 bg-black p-1 m-2 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default HostelImagesGallery;
