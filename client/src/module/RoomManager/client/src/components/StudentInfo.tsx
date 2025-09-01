import { Student } from "@/types";


interface StudentInfoProps {
  student: Student;
}


const StudentInfo = ({ student }: StudentInfoProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Student Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Student Name</p>
          <p className="font-medium">{student.fullName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Registration Number</p>
          <p className="font-medium">{student.regNo}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Year of Study</p>
          <p className="font-medium">{student.yearOfStudy}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Course</p>
          <p className="font-medium">{student.course}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Gender</p>
          <p className="font-medium">{student.gender}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Contact Number</p>
          <p className="font-medium">{student.contactNo}</p>
        </div>
      </div>
    </div>
  );
};


export default StudentInfo;




