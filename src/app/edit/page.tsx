import { Metadata } from 'next';
import EditClient from './EditClient';

export const metadata: Metadata = {
  title: 'Edit PDF - Edit your PDF online for free',
  description: 'Edit PDF files directly in your browser. Add text, highlights, and more.',
};

export default function EditPage() {
  return <EditClient />;
}
