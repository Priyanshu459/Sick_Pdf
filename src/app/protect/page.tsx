import { Metadata } from 'next';
import ProtectClient from './ProtectClient';

export const metadata: Metadata = {
  title: 'Protect PDF - Add password to PDF online',
  description: 'Encrypt your PDF with a password to keep sensitive data confidential.',
};

export default function ProtectPDFPage() {
  return <ProtectClient />;
}
