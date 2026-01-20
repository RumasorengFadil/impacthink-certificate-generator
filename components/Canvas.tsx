import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { AlertCircle, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button } from './ui/button';
import { DraggableText } from './DraggableText';
import { CertificateData, TextElement } from '@/types';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface CanvasProps {
  pdfDataUrl: string | null;
  textElements: TextElement[];
  updateTextElement: (id: string, updates: Partial<TextElement>) => void;
  certificateData: CertificateData;
  onCanvasWidthChange: (width: number) => void;
}

export default function Canvas({
  pdfDataUrl,
  textElements,
  updateTextElement,
  certificateData,
  onCanvasWidthChange,
}: CanvasProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(800);
  const [zoom, setZoom] = useState<number>(100);
  const baseWidth = 800; // Base width for coordinate system

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  // Update parent component when page width changes
  useEffect(() => {
    onCanvasWidthChange(pageWidth);
  }, [pageWidth, onCanvasWidthChange]);

  // Update page width based on zoom
  useEffect(() => {
    setPageWidth((baseWidth * zoom) / 100);
  }, [zoom]);

  // Calculate scale factor for text elements
  const scale = pageWidth / baseWidth;
  
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const getTextContent = (element: TextElement): string => {
    switch (element.type) {
      case 'name':
        return certificateData.recipientName || 'Recipient Name';
      case 'certNumber':
        return certificateData.certificateNumber || 'NO: 13.024/IMPCT/V/2025';
      case 'issueDate':
        return certificateData.issueDate || '19 Januari 2026';
      default:
        return '';
    }
  };

  // Handle drag updates - convert from display coordinates to base coordinates
  const handleTextDrag = (id: string, displayX: number, displayY: number) => {
    const baseX = displayX / scale;
    const baseY = displayY / scale;
    updateTextElement(id, { x: baseX, y: baseY });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Certificate Preview</h2>
          <p className="text-sm text-gray-500 mt-1">
            Drag text elements to position them on the certificate. Use zoom controls to adjust view.
          </p>
        </div>
        {pdfDataUrl && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="hover:bg-blue-50 hover:border-blue-300"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetZoom}
              className="hover:bg-blue-50 hover:border-blue-300"
            >
              <Maximize2 className="w-4 h-4 mr-1" />
              {zoom}%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 150}
              className="hover:bg-blue-50 hover:border-blue-300"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-8 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="flex justify-center min-h-full items-center">
          {pdfDataUrl ? (
            <div className="relative bg-white shadow-2xl rounded-lg overflow-hidden" style={{ width: `${pageWidth}px` }}>
              <Document
                file={pdfDataUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                className="relative"
              >
                <Page
                  pageNumber={1}
                  width={pageWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>

              {/* Draggable Text Elements */}
              {textElements.map((element) => (
                <DraggableText
                  key={element.id}
                  element={element}
                  content={getTextContent(element)}
                  onDrag={(x, y) => handleTextDrag(element.id, x, y)}
                  scale={scale}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-gray-400 bg-white rounded-lg shadow-lg p-12">
              <AlertCircle className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium text-gray-700">No Template Uploaded</p>
              <p className="text-sm mt-2 text-gray-500 text-center max-w-sm">
                Upload a PDF certificate template from the sidebar to get started with your certificate design
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      {pdfDataUrl && (
        <div className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Page 1 of {numPages || 1}</span>
            <span>Width: {pageWidth}px</span>
          </div>
        </div>
      )}
    </div>
  );
}