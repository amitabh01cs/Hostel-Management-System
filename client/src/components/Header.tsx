import headerImg from "@assets/header.png";

const Header = () => {
  return (
    <header className="bg-white py-4 px-4 md:px-8 shadow-sm">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-center">
          <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto pb-2 md:pb-0">
            <img
              src={headerImg}
              alt="IIST-IIP-IIMR Logo Header"
              className="h-10 md:h-14 w-auto"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
