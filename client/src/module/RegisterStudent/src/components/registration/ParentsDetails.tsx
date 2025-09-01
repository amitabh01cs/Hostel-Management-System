
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ParentsData {
  fatherName: string;
  fatherOccupation: string;
  fatherEducation: string;
  fatherEmail: string;
  fatherMobile: string;
  motherName: string;
  motherOccupation: string;
  motherEducation: string;
  motherEmail: string;
  motherMobile: string;
  permanentAddress: string;
  city: string;
  state: string;
  pinCode: string;
  residencePhone?: string;
  officePhone?: string;
  officeAddress: string;
  guardianName: string;
  guardianAddress: string;
  guardianPhone: string;
  guardianMobile: string;
  emergencyContact: string;
}

interface ParentsDetailsProps {
  parentsData: ParentsData;
  onEdit: () => void;
  printMode?: boolean;
}

const ParentsDetails: React.FC<ParentsDetailsProps> = ({ 
  parentsData, 
  onEdit,
  printMode = false
}) => {
  return (
    <Card className="p-6 relative">
      {!printMode && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onEdit}
          className="absolute top-2 right-2 text-yojana-purple hover:text-yojana-purple-dark print:hidden"
        >
          Edit
        </Button>
      )}
      <h3 className="text-lg font-semibold text-yojana-purple mb-4">Parents Details</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-2">Father:</h4>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {parentsData.fatherName}</p>
            <p><span className="font-medium">Occupation:</span> {parentsData.fatherOccupation}</p>
            <p><span className="font-medium">Education:</span> {parentsData.fatherEducation}</p>
            <p><span className="font-medium">Email:</span> {parentsData.fatherEmail || 'N/A'}</p>
            <p><span className="font-medium">Mobile:</span> {parentsData.fatherMobile}</p>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2">Mother:</h4>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {parentsData.motherName}</p>
            <p><span className="font-medium">Occupation:</span> {parentsData.motherOccupation}</p>
            <p><span className="font-medium">Education:</span> {parentsData.motherEducation}</p>
            <p><span className="font-medium">Email:</span> {parentsData.motherEmail || 'N/A'}</p>
            <p><span className="font-medium">Mobile:</span> {parentsData.motherMobile}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium mb-2">Permanent Address:</h4>
        <p>{parentsData.permanentAddress}</p>
        <p>{parentsData.city}, {parentsData.state} - {parentsData.pinCode}</p>
        <p><span className="font-medium">Residence Phone:</span> {parentsData.residencePhone || 'N/A'}</p>
        <p><span className="font-medium">Office Phone:</span> {parentsData.officePhone || 'N/A'}</p>
        
        <h4 className="font-medium mt-4 mb-2">Office Address:</h4>
        <p>{parentsData.officeAddress}</p>
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium mb-2">Local Guardian Details:</h4>
        <p><span className="font-medium">Name:</span> {parentsData.guardianName}</p>
        <p><span className="font-medium">Address:</span> {parentsData.guardianAddress}</p>
        <p><span className="font-medium">Phone:</span> {parentsData.guardianPhone}</p>
        <p><span className="font-medium">Mobile:</span> {parentsData.guardianMobile}</p>
        <p><span className="font-medium">Emergency Contact:</span> {parentsData.emergencyContact}</p>
      </div>
    </Card>
  );
};

export default ParentsDetails;
