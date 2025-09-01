import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

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
  photo: File | string | null;
  semester: string;
}

interface BoarderDetailsProps {
  boarderData: BoarderData;
  onEdit: () => void;
  printMode?: boolean;
}

const BoarderDetails: React.FC<BoarderDetailsProps> = ({
  boarderData,
  onEdit,
  printMode = false,
}) => {
  // Determine image source
  let imgSrc: string | undefined;
  if (boarderData.photo) {
    if (typeof boarderData.photo === "string") {
      imgSrc = boarderData.photo;
    } else if (boarderData.photo instanceof File) {
      imgSrc = URL.createObjectURL(boarderData.photo);
    }
  }

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
      <h3 className="text-lg font-semibold text-yojana-purple mb-4">Boarder Details</h3>
      <div className="flex flex-col md:flex-row">
        {imgSrc && (
          <div className="md:w-1/4 mb-4 md:mb-0">
            <img
              src={imgSrc}
              alt="Boarder"
              className="w-32 h-32 object-cover rounded-md"
            />
          </div>
        )}
        <div className={imgSrc ? "md:w-3/4" : "w-full"}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Full Name:</p>
              <p>{boarderData.fullName}</p>
            </div>
            <div>
              <p className="font-medium">Date of Birth:</p>
              <p>
                {boarderData.dateOfBirth
                  ? format(new Date(boarderData.dateOfBirth), "dd/MM/yyyy")
                  : ""}
              </p>
            </div>
            <div>
              <p className="font-medium">Gender:</p>
              <p>{boarderData.gender}</p>
            </div>
            <div>
              <p className="font-medium">Religion:</p>
              <p>{boarderData.religion}</p>
            </div>
            <div>
              <p className="font-medium">Category:</p>
              <p>{boarderData.category}</p>
            </div>
            <div>
              <p className="font-medium">Nationality:</p>
              <p>
                {boarderData.nationality}
                {boarderData.otherCountry
                  ? ` (${boarderData.otherCountry})`
                  : ""}
              </p>
            </div>
            <div>
              <p className="font-medium">Mobile:</p>
              <p>{boarderData.mobileNo}</p>
            </div>
            <div>
              <p className="font-medium">Email:</p>
              <p>{boarderData.email}</p>
            </div>
            <div>
              <p className="font-medium">Aadhar Number:</p>
              <p>{boarderData.aadharNo}</p>
            </div>
            <div>
              <p className="font-medium">Password:</p>
              <p>{boarderData.studentPassword}</p>
            </div>
            <div>
              <p className="font-medium">Course Details:</p>
              <p>{boarderData.courseDetails}</p>
            </div>
            <div>
              <p className="font-medium">Institute:</p>
              <p>{boarderData.instituteName}</p>
            </div>
            <div>
              <p className="font-medium">Course & Branch:</p>
              <p>
                {boarderData.course} - {boarderData.branch}
              </p>
            </div>
            <div>
              <p className="font-medium">Year of Study:</p>
              <p>{boarderData.yearOfStudy}</p>
            </div>
            <div>
              <p className="font-medium">Semester:</p>
              <p>{boarderData.semester}</p>
            </div>
            <div>
              <p className="font-medium">Admission Date:</p>
              <p>
                {boarderData.admissionDate
                  ? format(new Date(boarderData.admissionDate), "dd/MM/yyyy")
                  : ""}
              </p>
            </div>
            <div>
              <p className="font-medium">Hostel Joining Date:</p>
              <p>
                {boarderData.hostelJoiningDate
                  ? format(new Date(boarderData.hostelJoiningDate), "dd/MM/yyyy")
                  : ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BoarderDetails;