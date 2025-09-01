
export interface BoarderData {
  fullName: string;
  dateOfBirth: Date;
  gender: string;
  religion: string;
  category: string;
  nationality: string;
  otherCountry?: string;
  mobileNo: string;
  email: string;
  aadharNo: string;
  studentPassword: string;
  courseDetails: string;
  instituteName: string;
  course: string;
  branch: string;
  yearOfStudy: string;
  admissionDate: Date;
  hostelJoiningDate: Date;
  photo:  File | string | null;
}

export interface ParentsData {
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

export interface MedicalData {
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
