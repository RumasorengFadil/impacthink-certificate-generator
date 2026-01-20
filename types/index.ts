export interface TextElement {
  id: string;
  type: 'name' | 'certNumber' | 'issueDate';
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  align?: 'left' | 'center' | 'right';
  fontWeight?: 'bold' | 'normal' | 'lighter'
}

export interface CertificateData {
  recipientName: string;
  certificateNumber: string;
  issueDate: string;
}

export interface CalculateAlignedXParams {
  x: number;        // posisi anchor (misalnya titik tengah atau kiri)
  width: number;    // lebar text (offsetWidth)
  align?: 'left' | 'center' | 'right'; // alignment
}