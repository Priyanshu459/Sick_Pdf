import { Metadata } from 'next';
import JpgToPdfClient from './JpgToPdfClient';

export const metadata: Metadata = {
  title: 'JPG to PDF - Convert JPG images to PDF online',
  description: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.',
};

export default function JpgToPdfPage() {
  return <JpgToPdfClient />;
}
