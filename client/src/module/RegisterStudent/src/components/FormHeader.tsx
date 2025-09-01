
import React from 'react';

interface FormHeaderProps {
  currentStep: number;
  totalSteps: number;
}

const FormHeader = ({ currentStep, totalSteps }: FormHeaderProps) => {
  const steps = ["Boarder Details", "Parents Details", "Medical Details"];
  
  return (
    <div className="w-full mb-8">
      <div className="flex justify-center mb-4">
        {/* <img 
          src="public/lovable-uploads/a8e8e2a8-c635-4571-bb3c-d4528262d61c.png" 
          alt="IIST Logo with NAAC Accreditation" 
          className="h-20 object-contain"
        /> */}
      </div>
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
        Hostel Registration Form
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Please fill all the details to complete your registration
      </p>
      
      {/* Steps Progress Bar */}
      <div className="relative flex justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center w-full">
            <div className="flex items-center relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep > index 
                  ? "bg-yojana-purple text-white" 
                  : currentStep === index 
                  ? "bg-yojana-purple text-white" 
                  : "bg-gray-200 text-gray-500"
              }`}>
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 w-full absolute top-5 left-10 ${
                  currentStep > index ? "bg-yojana-purple" : "bg-gray-200"
                }`} style={{ width: "calc(100% - 2.5rem)" }}></div>
              )}
            </div>
            <span className={`mt-2 text-xs font-medium ${
              currentStep >= index ? "text-yojana-purple" : "text-gray-500"
            }`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormHeader;
