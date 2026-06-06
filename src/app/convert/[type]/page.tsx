'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { FileUp, X, Loader2, ArrowRight } from 'lucide-react';
import styles from '../../server-tool.module.css';
import { usePathname } from 'next/navigation';

const TYPE_CONFIG = {
  'word-to-pdf': { title: 'Word to PDF', subtitle: 'Make DOC and DOCX files easy to read by converting them to PDF.', accept: '.doc,.docx' },
  'excel-to-pdf': { title: 'Excel to PDF', subtitle: 'Make EXCEL spreadsheets easy to read by converting them to PDF.', accept: '.xls,.xlsx' },
  'ppt-to-pdf': { title: 'PowerPoint to PDF', subtitle: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.', accept: '.ppt,.pptx' },
  'pdf-to-word': { title: 'PDF to Word', subtitle: 'Convert your PDF to WORD documents with incredible accuracy.', accept: 'application/pdf' },
  'pdf-to-excel': { title: 'PDF to Excel', subtitle: 'Convert PDF Data to EXCEL Spreadsheets.', accept: 'application/pdf' },
  'pdf-to-ppt': { title: 'PDF to PowerPoint', subtitle: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.', accept: 'application/pdf' },
  'jpg-to-pdf': { title: 'JPG to PDF', subtitle: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.', accept: 'image/jpeg,image/jpg,image/png' },
  'pdf-to-jpg': { title: 'PDF to JPG', subtitle: 'Extract pages from your PDF file and save them as high-quality JPG images.', accept: 'application/pdf' },
};

export default function GenericConvert({ params }: { params: { type: string } }) {
  // We use usePathname to handle the type generically as this is a client component
  // In Next.js App router, params are sometimes better accessed or we just use pathname
  const pathname = usePathname();
  const type = pathname.split('/').pop() || 'word-to-pdf';
  
  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG['word-to-pdf'];

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError('');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Conversion failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      let ext = '.pdf';
      if (type === 'pdf-to-word') ext = '.docx';
      else if (type === 'pdf-to-excel') ext = '.xlsx';
      else if (type === 'pdf-to-ppt') ext = '.pptx';
      else if (type === 'pdf-to-jpg') ext = '.zip';
      link.download = `converted_${file.name.split('.')[0]}${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{config.title}</h1>
        <p className={styles.subtitle}>{config.subtitle}</p>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {!file ? (
        <div 
          className={`${styles.dropzone} ${isDragging ? styles.active : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            accept={config.accept}
            ref={fileInputRef} 
            onChange={handleFileSelect}
            style={{ display: 'none' }} 
          />
          <FileUp className={styles.icon} />
          <button className={styles.uploadBtn}>Select file</button>
          <p>or drop file here</p>
        </div>
      ) : (
        <div className={styles.editor}>
          <div className={styles.fileHeader}>
            <div className={styles.fileName}>{file.name}</div>
            <button 
              style={{ color: 'var(--text-muted)', padding: '0.5rem' }} 
              onClick={() => setFile(null)}
            >
              <X size={24} />
            </button>
          </div>

          <div className={styles.actions}>
            <button 
              className={styles.actionBtn} 
              onClick={processFile} 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 className="animate-spin" /> Converting...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Convert <ArrowRight size={20} />
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
