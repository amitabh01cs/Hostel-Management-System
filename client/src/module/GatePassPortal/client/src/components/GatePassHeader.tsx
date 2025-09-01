import headerImage from "../../../attached_assets/header_cropped.png";

export default function GatePassHeader() {
  return (
    <div className="bg-gray-50 py-3 px-6 text-center border-b border-gray-200">
      <h2 className="font-semibold text-gray-700 mb-2">BOYS' / GIRLS HOSTEL</h2>
      <div className="flex justify-center">
        <img 
          src={headerImage} 
          alt="Institution logos" 
          className="h-10"
        />
      </div>
    </div>
  );
}
