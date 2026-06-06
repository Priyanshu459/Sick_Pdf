'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { FileUp, File, X, Loader2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import styles from './page.module.css';

export default function MergePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const mergePDFs = async () => {
    if (files.length < 2) return;
    setIsMerging(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged_document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('An error occurred while merging the PDFs.');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Merge PDF files</h1>
        <p className={styles.subtitle}>Combine PDFs in the order you want with the easiest PDF merger available.</p>
      </div>

      {files.length === 0 ? (
        <div 
          className={`${styles.dropzone} ${isDragging ? styles.active : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            multiple 
            accept="application/pdf" 
            ref={fileInputRef} 
            onChange={handleFileSelect}
            style={{ display: 'none' }} 
          />
          <FileUp className={styles.icon} />
          <button className={styles.uploadBtn}>Select PDF files</button>
          <p>or drop PDFs here</p>
        </div>
      ) : (
        <>
          <div className={styles.fileList}>
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className={styles.fileItem}>
                <div className={styles.fileInfo}>
                  <File className={styles.fileIcon} />
                  <span className={styles.fileName}>{file.name}</span>
                </div>
                <button className={styles.removeBtn} onClick={() => removeFile(index)}>
                  <X size={20} />
                </button>
              </div>
            ))}
            
            <button 
              className={styles.uploadBtn} 
              style={{ alignSelf: 'flex-start', marginTop: '1rem', background: 'var(--bg-hover)', color: 'var(--text-main)' }}
              onClick={() => fileInputRef.current?.click()}
            >
              + Add more files
            </button>
            <input 
              type="file" 
              multiple 
              accept="application/pdf" 
              ref={fileInputRef} 
              onChange={handleFileSelect}
              style={{ display: 'none' }} 
            />
          </div>

          <div className={styles.actions}>
            <button 
              className={styles.mergeBtn} 
              onClick={mergePDFs} 
              disabled={files.length < 2 || isMerging}
            >
              {isMerging ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 className="animate-spin" /> Merging...
                </span>
              ) : 'Merge PDF'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
