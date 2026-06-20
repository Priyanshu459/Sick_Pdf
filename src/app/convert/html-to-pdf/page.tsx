import { Metadata } from 'next';
import HtmlToPdfClient from './HtmlToPdfClient';

export const metadata: Metadata = {
  title: 'HTML to PDF - Convert web pages to PDF online',
  description: 'Convert web pages, URLs, or raw HTML code into high-quality PDF documents instantly.',
};

export default function HtmlToPdfPage() {
  return <HtmlToPdfClient />;
}
