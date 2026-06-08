import { Metadata } from 'next';
import SplitClient from './SplitClient';

export const metadata: Metadata = {
  title: 'Split PDF - Extract pages from your PDF online',
  description: 'Extract specific pages into a new document with our easy to use PDF splitter.',
};

export default function SplitPDFPage() {
  return <SplitClient />;
}
