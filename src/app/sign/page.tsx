import { Metadata } from 'next';
import SignClient from './SignClient';

export const metadata: Metadata = {
  title: 'Sign PDF - Add your signature to PDF online',
  description: 'Upload your document and append your signature image to the last page.',
};

export default function SignPDFPage() {
  return <SignClient />;
}
