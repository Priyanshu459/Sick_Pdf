import { Metadata } from 'next';
import UnlockClient from './UnlockClient';

export const metadata: Metadata = {
  title: 'Unlock PDF - Remove PDF password online',
  description: 'Remove PDF password security, giving you the freedom to use your PDFs as you want.',
};

export default function UnlockPDFPage() {
  return <UnlockClient />;
}
