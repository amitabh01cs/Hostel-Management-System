import { Menu, User } from "lucide-react";
import { cn } from "@/lib/utils";
import headerImage from "@assets/header.png";

type HeaderProps = {
  title: string;
  toggleSidebar: () => void;
};

const Header = ({ title, toggleSidebar }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-3 md:hidden flex items-center justify-center rounded-md w-10 h-10 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 text-gray-500" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      </div>

      <div className="md:hidden">
        <img src={headerImage} alt="Hostel Management" className="h-8" />
      </div>

      <div className="flex items-center">
        <div className="mr-3 text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-800">Student</p>
          <p className="text-xs text-gray-500">student@hostel.edu</p>
        </div>
        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white">
          <User className="h-5 w-5" />
        </div>
      </div>
    </header>
  );
};

export default Header;
