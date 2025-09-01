
import React from 'react';

const SignatureSection: React.FC = () => {
  return (
    <div className="hidden print:block mt-16">
      <div className="flex justify-between">
        <div className="w-1/3">
          <div className="border-t border-gray-300 mt-16 pt-2 text-center">
            Student Signature
          </div>
        </div>
        <div className="w-1/3">
          <div className="border-t border-gray-300 mt-16 pt-2 text-center">
            Guardian Signature
          </div>
        </div>
        <div className="w-1/3">
          <div className="border-t border-gray-300 mt-16 pt-2 text-center">
            Warden Signature
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureSection;
