"use client"
import { Upload, Download, FileText, Settings, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

import { useState } from 'react';
import { CertificateData, TextElement } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from '@radix-ui/react-label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Separator } from '@radix-ui/react-separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { bulkDownloadCertificates, downloadCertificate } from '@/utils/certificate-generator';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

interface SidebarProps {
  certificateData: CertificateData;
  setCertificateData: (data: CertificateData) => void;
  bulkRecipients: string;
  setBulkRecipients: (value: string) => void;
  textElements: TextElement[];
  updateTextElement: (id: string, updates: Partial<TextElement>) => void;
  onPdfUpload: (file: File) => void;
  pdfFile: File | null;
  canvasWidth: number;
}

export function Sidebar({
  certificateData,
  setCertificateData,
  bulkRecipients,
  setBulkRecipients,
  textElements,
  updateTextElement,
  onPdfUpload,
  pdfFile,
  canvasWidth,
}: SidebarProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onPdfUpload(file);
    }
  };

  const handleGenerateCertificate = async () => {
    setIsGenerating(true);
    try {
      await downloadCertificate(
        pdfFile!,
        textElements,
        certificateData,
        canvasWidth
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkGenerate = async () => {
    setIsBulkGenerating(true);
    try {
      await bulkDownloadCertificates(
        pdfFile!,
        textElements,
        certificateData,
        bulkRecipients,
        canvasWidth
      );
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const fontFamilies = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
        <h1 className="text-2xl text-white font-bold">Impacthink</h1>
        <p className="text-sm text-blue-100 mt-1">Certificate Generator</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* PDF Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="w-5 h-5 text-blue-600" />
              Upload Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Label htmlFor="pdf-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  {pdfFile ? (
                    <div className="flex flex-col items-center">
                      <FileText className="w-10 h-10 text-blue-600 mb-2" />
                      <p className="text-sm text-gray-700 font-medium">{pdfFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Click to change</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload PDF</p>
                      <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
                    </div>
                  )}
                </div>
              </Label>
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </CardContent>
        </Card>

        {/* Certificate Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-blue-600" />
              Certificate Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single</TabsTrigger>
                <TabsTrigger value="bulk">Bulk</TabsTrigger>
              </TabsList>
              <TabsContent value="single" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient-name">Recipient Name</Label>
                  <Input
                    id="recipient-name"
                    placeholder="Enter recipient name"
                    value={certificateData.recipientName}
                    onChange={(e) =>
                      setCertificateData({
                        ...certificateData,
                        recipientName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cert-number">Certificate Number</Label>
                  <Input
                    id="cert-number"
                    placeholder="NO: 13.024/IMPCT/V/2025"
                    value={certificateData.certificateNumber}
                    onChange={(e) =>
                      setCertificateData({
                        ...certificateData,
                        certificateNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issue-date">Issue Date</Label>
                  <Input
                    id="issue-date"
                    type="text"
                    placeholder="19 Januari 2026"
                    value={certificateData.issueDate}
                    onChange={(e) =>
                      setCertificateData({
                        ...certificateData,
                        issueDate: e.target.value,
                      })
                    }
                  />
                </div>
              </TabsContent>
              <TabsContent value="bulk" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk-recipients">Recipients (comma-separated)</Label>
                  <Textarea
                    id="bulk-recipients"
                    placeholder="John Doe, Jane Smith, Michael Johnson..."
                    value={bulkRecipients}
                    onChange={(e) => setBulkRecipients(e.target.value)}
                    rows={6}
                  />
                  <p className="text-xs text-gray-500">
                    Enter multiple names separated by commas
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Text Styling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-blue-600" />
              Text Styling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {textElements.map((element) => (
              <div key={element.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold capitalize">
                    {element.type === 'certNumber' ? 'Certificate Number' : element.type}
                  </Label>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={`${element.id}-font`} className="text-xs">
                      Font
                    </Label>
                    <Select
                      value={element.fontFamily}
                      onValueChange={(value) =>
                        updateTextElement(element.id, { fontFamily: value })
                      }
                    >
                      <SelectTrigger id={`${element.id}-font`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontFamilies.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${element.id}-size`} className="text-xs">
                      Size
                    </Label>
                    <Input
                      id={`${element.id}-size`}
                      type="number"
                      value={element.fontSize}
                      onChange={(e) =>
                        updateTextElement(element.id, {
                          fontSize: parseInt(e.target.value) || 16,
                        })
                      }
                      min="8"
                      max="120"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${element.id}-color`} className="text-xs">
                    Color
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={`${element.id}-color`}
                      type="color"
                      value={element.color}
                      onChange={(e) =>
                        updateTextElement(element.id, { color: e.target.value })
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={element.color}
                      onChange={(e) =>
                        updateTextElement(element.id, { color: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Alignment</Label>
                  <ToggleGroup
                    type="single"
                    value={element.textAlign}
                    onValueChange={(value) => {
                      if (value) {
                        updateTextElement(element.id, { textAlign: value as 'left' | 'center' | 'right' });
                      }
                    }}
                    className="justify-start"
                  >
                    <ToggleGroupItem value="left" aria-label="Align left" className="w-10">
                      <AlignLeft className="w-4 h-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="center" aria-label="Align center" className="w-10">
                      <AlignCenter className="w-4 h-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="right" aria-label="Align right" className="w-10">
                      <AlignRight className="w-4 h-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Width (px)</Label>
                  <Input
                    type="number"
                    value={element.width}
                    onChange={(e) =>
                      updateTextElement(element.id, { width: parseInt(e.target.value) || 200 })
                    }
                    min={50}
                    max={1000}
                    className="h-8"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 space-y-3">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
              onClick={handleGenerateCertificate}
              disabled={isGenerating || !pdfFile}
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Certificate'}
            </Button>
            <Button
              className="w-full bg-blue-700 hover:bg-blue-800"
              size="lg"
              disabled={!bulkRecipients.trim() || isBulkGenerating || !pdfFile}
              onClick={handleBulkGenerate}
            >
              <Download className="w-4 h-4 mr-2" />
              {isBulkGenerating ? 'Generating...' : 'Bulk Generate (ZIP)'}
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        {!pdfFile && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Quick Start Guide</h4>
              <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                <li>Upload a PDF certificate template</li>
                <li>Enter recipient information</li>
                <li>Drag text elements on the canvas</li>
                <li>Customize font styles and colors</li>
                <li>Generate single or bulk certificates</li>
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}