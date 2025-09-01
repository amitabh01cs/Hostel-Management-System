
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MedicalData {
  bloodGroup: string;
  seriousDisease: {
    status: 'yes' | 'no';
    details?: string;
  };
  regularMedication: {
    status: 'yes' | 'no';
    details?: string;
  };
  hospitalAdmission: {
    status: 'yes' | 'no';
    details?: string;
  };
  emergencyMedicines?: string;
  allergies?: string;
}

interface MedicalDetailsProps {
  medicalData: MedicalData;
  onEdit: () => void;
  printMode?: boolean;
}

const MedicalDetails: React.FC<MedicalDetailsProps> = ({ 
  medicalData, 
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
      <h3 className="text-lg font-semibold text-yojana-purple mb-4">Medical Details</h3>
      <div className="space-y-3">
        <p><span className="font-medium">Blood Group:</span> {medicalData.bloodGroup}</p>
        
        <div>
          <p className="font-medium">Serious Disease:</p>
          <p>{medicalData.seriousDisease.status === 'yes' 
            ? medicalData.seriousDisease.details 
            : 'No serious disease'}
          </p>
        </div>
        
        <div>
          <p className="font-medium">Regular Medication:</p>
          <p>{medicalData.regularMedication.status === 'yes' 
            ? medicalData.regularMedication.details 
            : 'No regular medication'}
          </p>
        </div>
        
        <div>
          <p className="font-medium">Hospital Admission Record:</p>
          <p>{medicalData.hospitalAdmission.status === 'yes' 
            ? medicalData.hospitalAdmission.details 
            : 'No hospital admission record'}
          </p>
        </div>
        
        <div>
          <p className="font-medium">Emergency Medicines:</p>
          <p>{medicalData.emergencyMedicines || 'None specified'}</p>
        </div>
        
        <div>
          <p className="font-medium">Allergies:</p>
          <p>{medicalData.allergies || 'None specified'}</p>
        </div>
      </div>
    </Card>
  );
};

export default MedicalDetails;
