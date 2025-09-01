import headerCroppedPath from "../../../attached_assets/header_cropped.png";
import { User, Menu } from "lucide-react";

interface HeaderProps {
  userName?: string;
  onHamburger?: () => void; // For mobile hamburger click
}

export function Header({ userName = "Student", onHamburger }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        {/* Hamburger icon for mobile screens */}
        <button
          className="md:hidden mr-2"
          onClick={onHamburger}
          aria-label="Open sidebar"
        >
          <Menu className="w-7 h-7 text-gray-700" />
        </button>
        {/* Centered Logo */}
        <div className="flex-1 flex justify-center md:justify-start">
          <img 
            src={headerCroppedPath} 
            alt="Institutional Logos" 
            className="h-12"
          />
        </div>
        {/* User info */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-institutional-orange rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">{userName}</span>
        </div>
      </div>
    </header>
  );
}