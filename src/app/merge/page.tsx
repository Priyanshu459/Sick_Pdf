import { Metadata } from 'next';
import MergeClient from './MergeClient';

export const metadata: Metadata = {
  title: 'Merge PDF - Combine PDF files online for free',
  description: 'Combine PDFs in the order you want with the easiest PDF merger available.',
};

export default function MergePDFPage() {
  return <MergeClient />;
}
