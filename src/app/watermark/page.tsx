import { Metadata } from 'next';
import WatermarkClient from './WatermarkClient';

export const metadata: Metadata = {
  title: 'Watermark PDF - Add watermark to PDF online',
  description: 'Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position.',
};

export default function WatermarkPage() {
  return <WatermarkClient />;
}
