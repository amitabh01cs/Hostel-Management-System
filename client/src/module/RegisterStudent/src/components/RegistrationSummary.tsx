import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Import your detail components and types
import { BoarderData, ParentsData, MedicalData } from './registration/types';
import BoarderDetails from './registration/BoarderDetails';
import ParentsDetails from './registration/ParentsDetails';
import MedicalDetails from './registration/MedicalDetails';
import SignatureSection from './registration/SignatureSection';

interface RegistrationSummaryProps {
  boarderData: BoarderData;
  parentsData: ParentsData;
  medicalData: MedicalData;
  onEditBoarder: () => void;
  onEditParents: () => void;
  onEditMedical: () => void;
  onClose: () => void;
}

const RegistrationSummary: React.FC<RegistrationSummaryProps> = ({
  boarderData,
  parentsData,
  medicalData,
  onEditBoarder,
  onEditParents,
  onEditMedical,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  // PRINT FUNCTIONALITY
  const handlePrint = useReactToPrint({
    documentTitle: `Hostel_Registration_${boarderData.fullName}`,
    content: () => printRef.current,
    onAfterPrint: () => console.log("Print completed"),
    onPrintError: (error) => console.error("Print failed", error),
    removeAfterPrint: false, // optional
  });

  // PDF DOWNLOAD FUNCTIONALITY (multi-page support)
  const handleDownload = async () => {
    if (!printRef.current) return;

    // Set A4 width (in pixels at 96dpi)
    const A4_WIDTH_PX = 794;
    const prevWidth = printRef.current.style.width;
    printRef.current.style.width = `${A4_WIDTH_PX}px`;

    // html2canvas for high-res screenshot
    const canvas = await html2canvas(printRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff",
      windowWidth: A4_WIDTH_PX,
      scrollY: -window.scrollY,
    });

    printRef.current.style.width = prevWidth; // Restore

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Multi-page logic
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = position - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`Hostel_Registration_${boarderData.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div>
      {/* Buttons */}
      <div className="flex justify-end gap-4 mb-4 print:hidden">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handlePrint}
        >
          <Printer size={18} />
          Print
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleDownload}
        >
          <Download size={18} />
          Download PDF
        </Button>
      </div>

      {/* Printable Content */}
      <div
        ref={printRef}
        className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto registration-summary-print"
        style={{ color: "#222", fontFamily: "sans-serif", fontSize: "14px" }}
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Registration Summary
        </h2>
        <div className="space-y-8">
          <BoarderDetails
            boarderData={boarderData}
            onEdit={onEditBoarder}
          />
          <ParentsDetails
            parentsData={parentsData}
            onEdit={onEditParents}
          />
          <MedicalDetails
            medicalData={medicalData}
            onEdit={onEditMedical}
          />
        </div>
        <div className="mt-8 text-center print:hidden">
          <Button
            onClick={onClose}
            className="bg-yojana-purple hover:bg-yojana-purple-dark px-8"
          >
            Close Summary
          </Button>
        </div>
        <SignatureSection />
      </div>

      {/* Print-specific CSS */}
      <style>
        {`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .registration-summary-print {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            padding: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
        `}
      </style>
    </div>
  );
};

export default RegistrationSummary;