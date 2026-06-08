import { Metadata } from 'next';
import PageNumbersClient from './PageNumbersClient';

export const metadata: Metadata = {
  title: 'Add Page Numbers to PDF online',
  description: 'Add page numbers into your PDF with ease. Choose your positions and dimensions.',
};

export default function PageNumbersPage() {
  return <PageNumbersClient />;
}
