import { Metadata } from 'next';
import OrganizeClient from './OrganizeClient';

export const metadata: Metadata = {
  title: 'Organize PDF pages - Sort, delete and rotate',
  description: 'Sort, delete, and rotate pages of your PDF file with ease.',
};

export default function OrganizePDFPage() {
  return <OrganizeClient />;
}
