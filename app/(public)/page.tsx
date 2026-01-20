"use client"
import { Sidebar } from "@/components/Sidebar";
import { CertificateData, TextElement } from "@/types";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

const Canvas = dynamic(
  () => import("@/components/Canvas"),
  { ssr: false } // ⬅️ INI KUNCI UTAMA
);

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(800);
  const [certificateData, setCertificateData] = useState<CertificateData>({
    recipientName: '',
    certificateNumber: 'NO: 13.024/IMPCT/V/2025',
    issueDate: "Jakarta, " + new Date().toLocaleDateString('id-ID'),
  });
  const [bulkRecipients, setBulkRecipients] = useState<string>('');
  const [textElements, setTextElements] = useState<TextElement[]>([
    {
      id: 'name',
      type: 'name',
      x: 400,
      y: 274,
      fontSize: 55,
      fontFamily: 'Poppins',
      color: '#02316a',
      align: 'center',
      fontWeight: 'bold',
    },
    {
      id: 'certNumber',
      type: 'certNumber',
      x: 408,
      y: 215,
      fontSize: 22,
      fontFamily: 'Montserrat',
      color: '#02316a',
      align: 'center',
    },
    {
      id: 'issueDate',
      type: 'issueDate',
      x: 397,
      y: 431,
      fontSize: 13,
      fontFamily: 'Montserrat',
      color: '#02316a',
      align: 'center',
      fontWeight: "bold"
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
      const url = "/files/CERTIFIED IMPACTHINK X PELINDO MEI.pdf";
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
