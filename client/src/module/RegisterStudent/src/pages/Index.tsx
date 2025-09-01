import React, { useEffect, useState } from "react";
import FormHeader from "../components/FormHeader";
import BoarderForm from "../components/BoarderForm";
import ParentsForm from "../components/ParentsForm";
import MedicalForm from "../components/MedicalForm";
import RegistrationSummary from "../components/RegistrationSummary";
import { Card, CardContent } from "../components/ui/card";
import { toast } from "../hooks/use-toast";
import Layout2 from "../../../HostelDashboard/client/src/components/layout/Layout2";
import { useAdminAuth } from "../../../HostelDashboard/client/src/hooks/useAdminAuth";
import axios from "axios";

// ----- TYPES -----
type BoarderFormValues = {
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
};

type ParentsFormValues = {
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
};

type MedicalFormValues = {
  bloodGroup: string;
  seriousDisease: {
    status: "yes" | "no";
    details?: string;
  };
  regularMedication: {
    status: "yes" | "no";
    details?: string;
  };
  hospitalAdmission: {
    status: "yes" | "no";
    details?: string;
  };
  emergencyMedicines?: string;
  allergies?: string;
};

// ----- HELPERS -----
const mapYearOfStudy = (val: string | number) => {
  if (!val) return "";
  const v = (val + "").trim().toLowerCase();
  if (v === "i" || v === "1" || v === "first") return "1";
  if (v === "ii" || v === "2" || v === "second") return "2";
  if (v === "iii" || v === "3" || v === "third") return "3";
  if (v === "iv" || v === "4" || v === "fourth") return "4";
  if (["1", "2", "3", "4"].includes(v)) return v;
  return val;
};

const mapBloodGroup = (bg: string) => {
  if (!bg) return "";
  if (bg.endsWith("_Pos")) return bg.replace("_Pos", "+");
  if (bg.endsWith("_Neg")) return bg.replace("_Neg", "-");
  return bg;
};

const mapGender = (gender: string) => {
  const g = gender.trim().toLowerCase();
  if (g === "male" || g === "m") return "M";
  if (g === "female" || g === "f") return "F";
  if (g === "other" || g === "o") return "O";
  return gender;
};

// ----- MAIN COMPONENT -----
const Index = () => {
  // AUTH LOGIC -- SARE HOOKS SABSE UPAR
  const { admin, loading } = useAdminAuth();

  const [step, setStep] = useState(0);
  const [boarderData, setBoarderData] = useState<BoarderFormValues | null>(null);
  const [parentsData, setParentsData] = useState<ParentsFormValues | null>(null);
  const [medicalData, setMedicalData] = useState<MedicalFormValues | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  // REDIRECT LOGIC
  useEffect(() => {
    if (!loading && !admin) {
      window.location.href = "/login";
    }
  }, [admin, loading]);

  if (loading) return <Layout2><div className="p-8">Loading...</div></Layout2>;
  if (!admin) return null;

  const handleBoarderSubmit = (data: BoarderFormValues) => {
    setBoarderData(data);
    setStep(1);
    window.scrollTo(0, 0);
  };

  const handleParentsSubmit = (data: ParentsFormValues) => {
    setParentsData(data);
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleMedicalSubmit = async (data: MedicalFormValues) => {
    setMedicalData(data);
    setShowSummary(true);
    window.scrollTo(0, 0);

    if (!boarderData || !parentsData) {
      toast({
        title: "Incomplete Form Data",
        description: "Please fill all steps before submitting.",
        variant: "destructive"
      });
      return;
    }

    let emergencyContactNo = "";
    let emergencyContactName = "";
    if (parentsData.emergencyContact?.match(/\d{10,}/)) {
      const match = parentsData.emergencyContact.match(/(.+?)?(\d{10,})/);
      if (match) {
        emergencyContactName = match[1]?.trim() || "";
        emergencyContactNo = match[2];
      } else {
        emergencyContactNo = parentsData.emergencyContact;
      }
    } else {
      emergencyContactName = parentsData.emergencyContact;
    }

    const formatDate = (d?: Date) =>
      d ? new Date(d).toISOString().split("T")[0] : "";

    const calcAge = (dobString: string) => {
      if (!dobString) return 0;
      const today = new Date();
      const dob = new Date(dobString);
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    };

    const payload = {
      aadharNo: boarderData.aadharNo,
      age: calcAge(formatDate(boarderData.dateOfBirth)),
      allergicTo: data.allergies || "",
      bloodGroup: mapBloodGroup(data.bloodGroup),
      branch: boarderData.branch,
      category: boarderData.category,
      cityDistrict: parentsData.city,
      course: boarderData.courseDetails,
      courseName: boarderData.course,
      dateOfAdmission: formatDate(boarderData.admissionDate),
      dob: formatDate(boarderData.dateOfBirth),
      emailId: boarderData.email,
      emergencyContactName,
      emergencyContactNo,
      emergencyMedicine: data.emergencyMedicines ? data.emergencyMedicines : "NO",
      fatherEducation: parentsData.fatherEducation,
      fatherEmail: parentsData.fatherEmail,
      fatherMobile: parentsData.fatherMobile,
      fatherName: parentsData.fatherName,
      fatherOccupation: parentsData.fatherOccupation,
      fullName: boarderData.fullName,
      gender: mapGender(boarderData.gender),
      hospitalRecord: data.hospitalAdmission.status === "yes" ? data.hospitalAdmission.details || "YES" : "NO",
      hostelJoinDate: formatDate(boarderData.hostelJoiningDate),
      instituteName: boarderData.instituteName,
      localGuardianAddress: parentsData.guardianAddress,
      localGuardianMobile: parentsData.guardianMobile,
      localGuardianName: parentsData.guardianName,
      localGuardianPhone: parentsData.guardianPhone,
      mobileNo: boarderData.mobileNo,
      motherEducation: parentsData.motherEducation,
      motherEmail: parentsData.motherEmail,
      motherMobile: parentsData.motherMobile,
      motherName: parentsData.motherName,
      motherOccupation: parentsData.motherOccupation,
      nationality: boarderData.nationality === "Other" ? boarderData.otherCountry : boarderData.nationality,
      officeAddress: parentsData.officeAddress,
      studentPassword: boarderData.studentPassword,
      permanentAddress: parentsData.permanentAddress,
      phoneOffice: parentsData.officePhone || "",
      phoneResidence: parentsData.residencePhone || "",
      pinCode: parentsData.pinCode,
      regularMedication: data.regularMedication.status === "yes" ? data.regularMedication.details || "YES" : "NO",
      religion: boarderData.religion,
      semesterYear: boarderData.semester,
      seriousDisease: data.seriousDisease.status === "yes" ? data.seriousDisease.details || "YES" : "NO",
      state: parentsData.state,
      yearOfStudy: mapYearOfStudy(boarderData.yearOfStudy),
    };

    // Use FormData for file upload
    const formData = new FormData();
    formData.append("student", JSON.stringify(payload));
    if (boarderData.photo instanceof File) {
      formData.append("photo", boarderData.photo);
    }

    try {
      await axios.post(
        "https://hostel-backend-module-production-iist.up.railway.app/api/student/add",
        formData
        // Don't set headers, browser will set for multipart
      );
      toast({
        title: "Registration Complete!",
        description: "Your hostel registration form has been submitted successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Registration failed. Please try again.",
        variant: "destructive"
      });
      console.error("Backend error:", err);
    }
  };

  return (
    <Layout2>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {!showSummary ? (
            <>
              <FormHeader currentStep={step} totalSteps={3} />
              <Card>
                <CardContent className="p-6">
                  {step === 0 && (
                    <BoarderForm
                      onNext={handleBoarderSubmit}
                      initialData={boarderData || undefined}
                    />
                  )}
                  {step === 1 && (
                    <ParentsForm
                      onNext={handleParentsSubmit}
                      onPrevious={() => setStep(0)}
                      initialData={parentsData || undefined}
                    />
                  )}
                  {step === 2 && (
                    <MedicalForm
                      onSubmit={handleMedicalSubmit}
                      onPrevious={() => setStep(1)}
                      initialData={medicalData || undefined}
                    />
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            boarderData && parentsData && medicalData && (
              <RegistrationSummary
                boarderData={boarderData}
                parentsData={parentsData}
                medicalData={medicalData}
                onEditBoarder={() => { setShowSummary(false); setStep(0); }}
                onEditParents={() => { setShowSummary(false); setStep(1); }}
                onEditMedical={() => { setShowSummary(false); setStep(2); }}
                onClose={() => {
                  setBoarderData(null);
                  setParentsData(null);
                  setMedicalData(null);
                  setShowSummary(false);
                  setStep(0);
                  window.scrollTo(0, 0);
                  toast({
                    title: "New Registration Started",
                    description: "You can now fill a new hostel registration form.",
                  });
                }}
              />
            )
          )}
        </div>
      </div>
    </Layout2>
  );
};

export default Index;