import { useState } from 'react';
import { HostelBed, HostelRoom } from '@/types/hostel';


interface BedComponentProps {
  bed: HostelBed;
  room: HostelRoom;
  onBedClick: (room: HostelRoom, bed: HostelBed) => void;
}


const BedComponent = ({ bed, room, onBedClick }: BedComponentProps) => {
  const [isHovered, setIsHovered] = useState(false);
 
  // Determine background color and text based on bed status
  let bgColor = '';
  let displayText = '';
 
  if (bed.status === 'empty') {
    bgColor = 'bg-gray-200';
    displayText = 'Empty bed';
  } else if (bed.status === 'occupied') {
    bgColor = 'bg-green-400';
    displayText = bed.bedId;
   
    // Show student name on hover for occupied beds
    if (isHovered && bed.student) {
      displayText = bed.student.fullName;
    }
  }
 
  return (
    <div
      className={`h-12 rounded-md cursor-pointer flex items-center justify-center text-center ${bgColor} mb-2`}
      onClick={() => onBedClick(room, bed)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="font-medium text-sm">{displayText}</span>
    </div>
  );
};


export default BedComponent;


