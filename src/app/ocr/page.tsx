import { Metadata } from 'next';
import OcrClient from './OcrClient';

export const metadata: Metadata = {
  title: 'OCR PDF - Convert PDF to text online',
  description: 'Convert scanned images to editable text formats using advanced Optical Character Recognition.',
};

export default function OcrPage() {
  return <OcrClient />;
}
