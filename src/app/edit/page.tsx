'use client';

import { useState, useRef } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { UploadCloud, Download, FileText, Trash2, RotateCw, Image as ImageIcon, Type, Droplet } from 'lucide-react';
import styles from './page.module.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function EditorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [activeTool, setActiveTool] = useState<'organize' | 'text' | 'image' | 'watermark'>('organize');
  
  // State for document manipulation
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [deletedPages, setDeletedPages] = useState<Set<number>>(new Set());
  
  // State for Add Text / Image / Watermark
  const [watermarkText, setWatermarkText] = useState('');
  const [customText, setCustomText] = useState('');
  const [textX, setTextX] = useState(50);
  const [textY, setTextY] = useState(50);
  const [textPage, setTextPage] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageX, setImageX] = useState(50);
  const [imageY, setImageY] = useState(50);
  const [imagePage, setImagePage] = useState(1);
  
  // Handlers
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const rotatePage = (pageIndex: number) => {
    setRotations(prev => ({
      ...prev,
      [pageIndex]: ((prev[pageIndex] || 0) + 90) % 360
    }));
  };

  const toggleDeletePage = (pageIndex: number) => {
    setDeletedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageIndex)) newSet.delete(pageIndex);
      else newSet.add(pageIndex);
      return newSet;
    });
  };

  const handleDownload = async () => {
    if (!file) return;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // Process deletions (in reverse order so indices don't shift)
    const pagesToDelete = Array.from(deletedPages).sort((a, b) => b - a);
    for (const pageIndex of pagesToDelete) {
      pdfDoc.removePage(pageIndex);
    }
    
    // Process rotations
    const pages = pdfDoc.getPages();
    for (let i = 0; i < pages.length; i++) {
      // Need to adjust index based on deleted pages
      // For a simple implementation, we assume we apply rotation before deletion logic index shifts, 
      // but actually pdf-lib pages array is updated. It's safer to map original index to current.
      // To simplify, we should just apply all rotations to the loaded doc before deleting.
    }
    
    // Re-load to make logic simpler:
    const finalDoc = await PDFDocument.load(arrayBuffer);
    const allPages = finalDoc.getPages();
    
    // Apply Rotations
    Object.entries(rotations).forEach(([idx, angle]) => {
      if (angle !== 0) {
        const page = allPages[parseInt(idx)];
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + angle));
      }
    });

    // Apply Custom Text
    if (customText.trim() && textPage >= 1 && textPage <= allPages.length) {
      const page = allPages[textPage - 1];
      page.drawText(customText, {
        x: textX,
        y: textY,
        size: 24,
        color: rgb(0, 0, 0),
      });
    }

    // Apply Custom Image
    if (imageFile && imagePage >= 1 && imagePage <= allPages.length) {
      const imageBytes = await imageFile.arrayBuffer();
      let pdfImage;
      if (imageFile.type === 'image/png') {
        pdfImage = await finalDoc.embedPng(imageBytes);
      } else if (imageFile.type === 'image/jpeg') {
        pdfImage = await finalDoc.embedJpg(imageBytes);
      }
      if (pdfImage) {
        const page = allPages[imagePage - 1];
        page.drawImage(pdfImage, {
          x: imageX,
          y: imageY,
          width: 150,
          height: 150,
        });
      }
    }

    // Apply Watermark to all non-deleted pages
    if (watermarkText.trim()) {
      allPages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 2 - 100,
          y: height / 2,
          size: 60,
          color: rgb(0.8, 0.2, 0.2),
          rotate: degrees(45),
          opacity: 0.3,
        });
      });
    }
    
    // Apply Deletions
    Array.from(deletedPages).sort((a, b) => b - a).forEach(idx => {
      finalDoc.removePage(idx);
    });
    
    const pdfBytes = await finalDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `edited_${file.name}`;
    link.click();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Advanced PDF Editor</h1>
        <p className={styles.subtitle}>Organize, annotate, and customize your documents.</p>
      </header>

      {!file ? (
        <div className={styles.uploadArea}>
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={onFileChange} 
            className={styles.fileInput} 
            id="pdf-upload" 
          />
          <label htmlFor="pdf-upload" className={styles.uploadLabel}>
            <UploadCloud className={styles.uploadIcon} />
            <span>Click to upload or drag and drop PDF</span>
          </label>
        </div>
      ) : (
        <div className={styles.editorLayout}>
          <aside className={styles.sidebar}>
            <div className={styles.tools}>
              <button 
                className={`${styles.toolBtn} ${activeTool === 'organize' ? styles.active : ''}`}
                onClick={() => setActiveTool('organize')}
              >
                <FileText size={18} /> Organize
              </button>
              <button 
                className={`${styles.toolBtn} ${activeTool === 'text' ? styles.active : ''}`}
                onClick={() => setActiveTool('text')}
              >
                <Type size={18} /> Add Text
              </button>
              <button 
                className={`${styles.toolBtn} ${activeTool === 'image' ? styles.active : ''}`}
                onClick={() => setActiveTool('image')}
              >
                <ImageIcon size={18} /> Add Image
              </button>
              <button 
                className={`${styles.toolBtn} ${activeTool === 'watermark' ? styles.active : ''}`}
                onClick={() => setActiveTool('watermark')}
              >
                <Droplet size={18} /> Watermark
              </button>
            </div>

            <div className={styles.toolOptions}>
              {activeTool === 'organize' && (
                <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '1rem' }}>
                  Click the rotate or trash icons on the pages to organize them.
                </p>
              )}

              {activeTool === 'text' && (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label>Text to add:</label>
                  <input type="text" value={customText} onChange={e => setCustomText(e.target.value)} placeholder="Enter text..." />
                  <label>Page Number:</label>
                  <input type="number" min={1} max={numPages} value={textPage} onChange={e => setTextPage(parseInt(e.target.value))} />
                  <label>X Coordinate:</label>
                  <input type="number" value={textX} onChange={e => setTextX(parseInt(e.target.value))} />
                  <label>Y Coordinate:</label>
                  <input type="number" value={textY} onChange={e => setTextY(parseInt(e.target.value))} />
                </div>
              )}

              {activeTool === 'image' && (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label>Upload Image:</label>
                  <input type="file" accept="image/png, image/jpeg" onChange={e => e.target.files && setImageFile(e.target.files[0])} />
                  <label>Page Number:</label>
                  <input type="number" min={1} max={numPages} value={imagePage} onChange={e => setImagePage(parseInt(e.target.value))} />
                  <label>X Coordinate:</label>
                  <input type="number" value={imageX} onChange={e => setImageX(parseInt(e.target.value))} />
                  <label>Y Coordinate:</label>
                  <input type="number" value={imageY} onChange={e => setImageY(parseInt(e.target.value))} />
                </div>
              )}

              {activeTool === 'watermark' && (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label>Watermark Text:</label>
                  <input type="text" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} placeholder="CONFIDENTIAL" />
                  <p style={{ fontSize: '0.8rem', color: '#888' }}>Applies diagonally to all pages.</p>
                </div>
              )}
            </div>
            
            <button className={styles.downloadBtn} onClick={handleDownload}>
              <Download size={18} /> Download PDF
            </button>
          </aside>

          <main className={styles.workspace}>
            <Document 
              file={file} 
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              className={styles.document}
            >
              <div className={styles.pagesGrid}>
                {Array.from(new Array(numPages), (el, index) => (
                  <div 
                    key={`page_${index + 1}`} 
                    className={`${styles.pageWrapper} ${deletedPages.has(index) ? styles.deleted : ''}`}
                  >
                    <div className={styles.pageControls}>
                      <button onClick={() => rotatePage(index)} className={styles.iconBtn} title="Rotate 90°">
                        <RotateCw size={16} />
                      </button>
                      <button onClick={() => toggleDeletePage(index)} className={`${styles.iconBtn} ${styles.deleteBtn}`} title="Delete Page">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div 
                      className={styles.pageInner}
                      style={{ transform: `rotate(${rotations[index] || 0}deg)` }}
                    >
                      <Page 
                        pageNumber={index + 1} 
                        width={250} 
                        renderTextLayer={false} 
                        renderAnnotationLayer={false} 
                      />
                    </div>
                    <div className={styles.pageLabel}>Page {index + 1}</div>
                  </div>
                ))}
              </div>
            </Document>
          </main>
        </div>
      )}
    </div>
  );
}
