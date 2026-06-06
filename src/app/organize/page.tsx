'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Settings2, X, RotateCw, Trash2, Loader2 } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import styles from './page.module.css';

interface PageData {
  originalIndex: number;
  rotation: number;
  deleted: boolean;
}

export default function OrganizePDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
      const pageCount = pdfDoc.getPageCount();
      
      const newPages: PageData[] = [];
      for (let i = 0; i < pageCount; i++) {
        newPages.push({ originalIndex: i, rotation: 0, deleted: false });
      }
      setPages(newPages);
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

  const rotatePage = (index: number) => {
    setPages(prev => {
      const newPages = [...prev];
      newPages[index].rotation = (newPages[index].rotation + 90) % 360;
      return newPages;
    });
  };

  const deletePage = (index: number) => {
    setPages(prev => {
      const newPages = [...prev];
      newPages[index].deleted = true;
      return newPages;
    });
  };

  const saveOrganizedPDF = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalDoc = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const activePages = pages.filter(p => !p.deleted);
      if (activePages.length === 0) {
        alert("You can't delete all pages!");
        setIsProcessing(false);
        return;
      }

      // We extract all active pages in their current order (which allows for reordering later if we add drag-n-drop)
      const indicesToExtract = activePages.map(p => p.originalIndex);
      const copiedPages = await newPdf.copyPages(originalDoc, indicesToExtract);
      
      copiedPages.forEach((page, i) => {
        const rotationToAdd = activePages[i].rotation;
        if (rotationToAdd > 0) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + rotationToAdd));
        }
        newPdf.addPage(page);
      });

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `organized_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error organizing PDF:', error);
      alert('An error occurred while saving the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const activePagesCount = pages.filter(p => !p.deleted).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Organize PDF pages</h1>
        <p className={styles.subtitle}>Sort, delete, and rotate pages of your PDF file.</p>
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
          <Settings2 className={styles.icon} />
          <button className={styles.uploadBtn}>Select PDF file</button>
          <p>or drop a PDF here</p>
        </div>
      ) : (
        <div className={styles.editor}>
          <div className={styles.fileHeader}>
            <div>
              <div className={styles.fileName}>{file.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {activePagesCount} pages active
              </div>
            </div>
            <button 
              style={{ color: 'var(--text-muted)', padding: '0.5rem' }} 
              onClick={() => setFile(null)}
            >
              <X size={24} />
            </button>
          </div>

          <div className={styles.pageGrid}>
            {pages.map((page, index) => {
              if (page.deleted) return null;
              return (
                <div 
                  key={`page-${page.originalIndex}`} 
                  className={styles.pageCard}
                  style={{ transform: `rotate(${page.rotation}deg)` }}
                >
                  <span 
                    className={styles.pageNumber}
                    style={{ transform: `rotate(-${page.rotation}deg)` }}
                  >
                    {page.originalIndex + 1}
                  </span>
                  
                  <div className={styles.pageControls} style={{ transform: `rotate(-${page.rotation}deg)` }}>
                    <button className={styles.controlBtn} onClick={() => rotatePage(index)}>
                      <RotateCw size={18} />
                    </button>
                    <button className={`${styles.controlBtn} ${styles.delete}`} onClick={() => deletePage(index)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.actions}>
            <button 
              className={styles.saveBtn} 
              onClick={saveOrganizedPDF} 
              disabled={isProcessing || activePagesCount === 0}
            >
              {isProcessing ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 className="animate-spin" /> Processing...
                </span>
              ) : 'Apply Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
