import Link from 'next/link';
import { 
  FilePlus2, 
  Scissors, 
  Minimize2, 
  FileText, 
  Image as ImageIcon, 
  FileDigit,
  Settings2,
  Lock,
  Unlock,
  PenTool,
  Type,
  Hash,
  ScanText,
  Cloud
} from 'lucide-react';
import styles from './page.module.css';

const TOOLS = [
  {
    title: 'Merge PDF',
    description: 'Combine PDFs in the order you want with the easiest PDF merger available.',
    icon: <FilePlus2 className={styles.toolIcon} />,
    href: '/merge',
    color: 'var(--primary)'
  },
  {
    title: 'Split PDF',
    description: 'Separate one page or a whole set for easy conversion into independent PDF files.',
    icon: <Scissors className={styles.toolIcon} />,
    href: '/split',
    color: 'var(--secondary)'
  },
  {
    title: 'Compress PDF',
    description: 'Reduce file size while optimizing for maximal PDF quality.',
    icon: <Minimize2 className={styles.toolIcon} />,
    href: '/compress',
    color: 'var(--danger)'
  },
  {
    title: 'PDF to Word',
    description: 'Easily convert your PDF files into easy to edit DOC and DOCX documents.',
    icon: <FileText className={styles.toolIcon} />,
    href: '/convert/pdf-to-word',
    color: '#3B82F6' // blue
  },
  {
    title: 'PDF to Excel',
    description: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.',
    icon: <FileDigit className={styles.toolIcon} />,
    href: '/convert/pdf-to-excel',
    color: '#10B981' // green
  },
  {
    title: 'JPG to PDF',
    description: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.',
    icon: <ImageIcon className={styles.toolIcon} />,
    href: '/convert/jpg-to-pdf',
    color: '#F59E0B' // amber
  },
  {
    title: 'Watermark PDF',
    description: 'Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position.',
    icon: <Type className={styles.toolIcon} />,
    href: '/watermark',
    color: '#06B6D4' // cyan
  },
  {
    title: 'Add Page Numbers',
    description: 'Add page numbers into your PDF with ease. Choose your positions and dimensions.',
    icon: <Hash className={styles.toolIcon} />,
    href: '/page-numbers',
    color: '#14B8A6' // teal
  },
  {
    title: 'Sign PDF',
    description: 'Upload your document and append your signature image to the last page.',
    icon: <PenTool className={styles.toolIcon} />,
    href: '/sign',
    color: '#8B5CF6' // violet
  },
  {
    title: 'Protect PDF',
    description: 'Encrypt your PDF with a password to keep sensitive data confidential.',
    icon: <Lock className={styles.toolIcon} />,
    href: '/protect',
    color: '#6366F1' // indigo
  },
  {
    title: 'Unlock PDF',
    description: 'Remove PDF password security, giving you the freedom to use your PDFs as you want.',
    icon: <Unlock className={styles.toolIcon} />,
    href: '/unlock',
    color: '#8B5CF6' // violet
  },
  {
    title: 'OCR Image',
    description: 'Convert scanned images to editable text formats using advanced Optical Character Recognition.',
    icon: <ScanText className={styles.toolIcon} />,
    href: '/ocr',
    color: '#EAB308' // yellow
  },
  {
    title: 'Cloud Storage',
    description: 'Connect your Google Drive or Dropbox accounts to directly save your converted files.',
    icon: <Cloud className={styles.toolIcon} />,
    href: '/cloud',
    color: '#3B82F6' // blue
  },
  {
    title: 'Organize PDF',
    description: 'Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages to your document.',
    icon: <Settings2 className={styles.toolIcon} />,
    href: '/organize',
    color: '#EC4899' // pink
  }
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "PDF Master",
    "url": "https://pdfmaster.rooted-feed.online",
    "description": "Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use!",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    }
  };

  return (
    <div className={styles.container}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className={styles.hero}>
        <h1 className={styles.title}>Every tool you need to work with PDFs in one place</h1>
        <p className={styles.subtitle}>
          Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, and edit with just a few clicks.
        </p>
      </header>

      <section className={styles.toolsGrid}>
        {TOOLS.map((tool) => (
          <Link href={tool.href} key={tool.title} className={styles.toolCard}>
            <div className={styles.iconWrapper} style={{ color: tool.color }}>
              {tool.icon}
            </div>
            <h3 className={styles.toolTitle}>{tool.title}</h3>
            <p className={styles.toolDesc}>{tool.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
