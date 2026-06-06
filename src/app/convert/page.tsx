import Link from 'next/link';
import { FileImage, FileText, Type } from 'lucide-react';

export const metadata = {
  title: 'Convert PDF - PDF Master',
  description: 'Convert files to and from PDF format easily.',
};

export default function ConvertLandingPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-color)', fontFamily: "'Outfit', sans-serif" }}>
          Convert PDFs
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Seamlessly convert your files to and from PDF format. Choose a tool below to get started.
        </p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <Link href="/convert/jpg-to-pdf" style={{ 
          display: 'flex', flexDirection: 'column', padding: '2rem', border: '1px solid var(--border-color)', 
          borderRadius: '12px', textDecoration: 'none', color: 'inherit', backgroundColor: 'var(--bg-card)',
          transition: 'transform 0.2s, boxShadow 0.2s'
        }}>
          <FileImage style={{ color: 'var(--primary)', marginBottom: '1rem' }} size={32} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>JPG to PDF</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Convert your JPG images into a single PDF document instantly and securely.
          </p>
        </Link>

        <Link href="/convert/pdf-to-jpg" style={{ 
          display: 'flex', flexDirection: 'column', padding: '2rem', border: '1px solid var(--border-color)', 
          borderRadius: '12px', textDecoration: 'none', color: 'inherit', backgroundColor: 'var(--bg-card)',
          transition: 'transform 0.2s, boxShadow 0.2s'
        }}>
          <FileText style={{ color: 'var(--primary)', marginBottom: '1rem' }} size={32} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>PDF to JPG</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Extract pages from your PDF file and save them as high-quality JPG images.
          </p>
        </Link>

        <Link href="/convert/word-to-pdf" style={{ 
          display: 'flex', flexDirection: 'column', padding: '2rem', border: '1px solid var(--border-color)', 
          borderRadius: '12px', textDecoration: 'none', color: 'inherit', backgroundColor: 'var(--bg-card)',
          transition: 'transform 0.2s, boxShadow 0.2s'
        }}>
          <Type style={{ color: 'var(--primary)', marginBottom: '1rem' }} size={32} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>Word to PDF</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Transform your Microsoft Word documents into perfectly formatted PDFs.
          </p>
        </Link>
      </div>
    </div>
  );
}
