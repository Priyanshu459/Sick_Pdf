'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Hash, X, Loader2 } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import styles from '../server-tool.module.css';

export default function PageNumbersPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<'left' | 'center' | 'right'>('center');
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
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        setError('Please upload a valid PDF file.');
      }
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        setError('Please upload a valid PDF file.');
      }
    }
  };

  const addPageNumbers = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pages = pdfDoc.getPages();
      const totalPages = pages.length;
      
      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const text = `Page ${index + 1} of ${totalPages}`;
        const textSize = 12;
        const textWidth = helveticaFont.widthOfTextAtSize(text, textSize);
        
        let xPos = width / 2 - textWidth / 2; // center
        if (position === 'left') xPos = 30;
        if (position === 'right') xPos = width - textWidth - 30;
        
        page.drawText(text, {
          x: xPos,
          y: 30, // 30 points from the bottom
          size: textSize,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `numbered_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while adding page numbers.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Add Page Numbers</h1>
        <p className={styles.subtitle}>Add page numbers into your PDF with ease. Choose your positions and dimensions.</p>
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
            accept="application/pdf" 
            ref={fileInputRef} 
            onChange={handleFileSelect}
            style={{ display: 'none' }} 
          />
          <Hash className={styles.icon} />
          <button className={styles.uploadBtn}>Select PDF file</button>
          <p>or drop a PDF here</p>
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

          <div className={styles.inputGroup}>
            <label className={styles.label}>Position</label>
            <select 
              className={styles.input} 
              value={position} 
              onChange={(e) => setPosition(e.target.value as any)}
              style={{ appearance: 'auto' }}
            >
              <option value="left">Bottom Left</option>
              <option value="center">Bottom Center</option>
              <option value="right">Bottom Right</option>
            </select>
          </div>

          <div className={styles.actions}>
            <button 
              className={styles.actionBtn} 
              onClick={addPageNumbers} 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 className="animate-spin" /> Processing...
                </span>
              ) : 'Add Page Numbers'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
