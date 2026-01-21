"use client"
import { Sidebar } from "@/components/Sidebar";
import { formatDateToEnglish } from "@/lib/utils";
import { CertificateData, FontWeight, TextElement } from "@/types";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

const Canvas = dynamic(
  () => import("@/components/Canvas"),
  { ssr: false } // ⬅️ INI KUNCI UTAMA
);

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string>("");
  const [canvasWidth, setCanvasWidth] = useState<number>(800);
  const [certificateData, setCertificateData] = useState<CertificateData>({
    recipientName: '',
    certificateNumber: 'NO: 13.024/IMPCT/V/2025',
    issueDate: formatDateToEnglish(new Date()),
  });
  const [bulkRecipients, setBulkRecipients] = useState<string>('');
  const [textElements, setTextElements] = useState<TextElement[]>([
    {
      id: 'name',
      type: 'name',
      x: 0,
      y: 274,
      fontSize: 55,
      fontFamily: 'Poppins',
      color: '#02316a',
      textAlign: 'center',
      fontWeight: FontWeight.BOLD,
      width: 800,
    },
    {
      id: 'certNumber',
      type: 'certNumber',
      x: 0,
      y: 212,
      fontSize: 22,
      fontFamily: 'Montserrat',
      color: '#02316a',
      textAlign: 'center',
      width: 800,
      fontWeight: FontWeight.NORMAL,
    },
    {
      id: 'issueDate',
      type: 'issueDate',
      x: 0,
      y: 431,
      fontSize: 13,
      fontFamily: 'Montserrat',
      color: '#02316a',
      textAlign: 'center',
      fontWeight: FontWeight.BOLD,
      width: 800,
    },
  ]);

  const handlePdfUpload = (file: File) => {
    setPdfFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result && typeof result === 'string') {
        setPdfDataUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  
  useEffect(() => {
    async function loadLocalPdf() {
      const url = "/files/Template Sertifikat Pelatihan_20260120_155131_0000.pdf";
      const res = await fetch(url);
      const blob = await res.blob();

      const file = new File([blob], "certificate.pdf", {
        type: blob.type,
      });

      setPdfFile(file);
      setPdfDataUrl(url);
    }

    loadLocalPdf();
  }, []);

  return (
    <>
      <div className="flex flex-col md:flex-row md:h-screen bg-gray-50">
        <Sidebar
          certificateData={certificateData}
          setCertificateData={setCertificateData}
          bulkRecipients={bulkRecipients}
          setBulkRecipients={setBulkRecipients}
          textElements={textElements}
          updateTextElement={updateTextElement}
          onPdfUpload={handlePdfUpload}
          pdfFile={pdfFile}
          canvasWidth={canvasWidth}
        />
        <Canvas
          pdfDataUrl={pdfDataUrl}
          textElements={textElements}
          updateTextElement={updateTextElement}
          certificateData={certificateData}
          onCanvasWidthChange={setCanvasWidth}
        />
      </div>
      <Toaster />
    </>
  );
}
