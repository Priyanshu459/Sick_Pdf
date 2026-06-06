'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Scissors, X, Loader2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import styles from './page.module.css';

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [ranges, setRanges] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPageCount(pdfDoc.getPageCount());
      setRanges(`1-${pdfDoc.getPageCount()}`);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Could not read the PDF file.');
      setFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        processFile(droppedFile);
      }
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        processFile(selectedFile);
      }
    }
  };

  const parseRanges = (rangeString: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = rangeString.split(',').map(p => p.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
            pages.add(i - 1); // 0-indexed for pdf-lib
          }
        }
      } else {
        const page = Number(part);
        if (!isNaN(page) && page >= 1 && page <= maxPages) {
          pages.add(page - 1);
        }
      }
    }
    
    return Array.from(pages).sort((a, b) => a - b);
  };

  const splitPDF = async () => {
    if (!file) return;
    setIsSplitting(true);

    try {
      const indicesToExtract = parseRanges(ranges, pageCount);
      if (indicesToExtract.length === 0) {
        alert('Please enter a valid page range.');
        setIsSplitting(false);
        return;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, indicesToExtract);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `extracted_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('An error occurred while splitting the PDF.');
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Split PDF file</h1>
        <p className={styles.subtitle}>Extract specific pages into a new document.</p>
      </div>

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
            accept="application/pdf" 
            ref={fileInputRef} 
            onChange={handleFileSelect}
            style={{ display: 'none' }} 
          />
          <Scissors className={styles.icon} />
          <button className={styles.uploadBtn}>Select PDF file</button>
          <p>or drop a PDF here</p>
        </div>
      ) : (
        <div className={styles.editor}>
          <div className={styles.fileHeader}>
            <div>
              <div className={styles.fileName}>{file.name}</div>
              <div className={styles.pageCount}>{pageCount} pages</div>
            </div>
            <button className={styles.removeBtn} onClick={() => setFile(null)}>
              <X size={24} />
            </button>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Pages to extract</label>
            <input 
              type="text" 
              className={styles.input} 
              value={ranges} 
              onChange={(e) => setRanges(e.target.value)}
              placeholder="e.g. 1-5, 8, 11-13"
            />
            <span className={styles.helpText}>Enter page numbers and/or ranges separated by commas (e.g. 1-3, 5, 8-10)</span>
          </div>

          <div className={styles.actions}>
            <button 
              className={styles.splitBtn} 
              onClick={splitPDF} 
              disabled={isSplitting || !ranges.trim()}
            >
              {isSplitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 className="animate-spin" /> Splitting...
                </span>
              ) : 'Split PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
