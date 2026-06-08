import { Metadata } from 'next';
import CompressClient from './CompressClient';

export const metadata: Metadata = {
  title: 'Compress PDF - Reduce PDF size online for free',
  description: 'Reduce file size while optimizing for maximal PDF quality.',
};

export default function CompressPDFPage() {
  return <CompressClient />;
}
