'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import styles from '../../server-tool.module.css';

export default function ImageToPDF() {
  const [files, setFiles] = useState<File[]>([]);
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
      const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type === 'image/jpeg' || file.type === 'image/png'
      );
      if (droppedFiles.length === 0) {
        setError('Please upload JPG or PNG images only.');
      } else {
        setFiles(prev => [...prev, ...droppedFiles]);
      }
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(file => 
        file.type === 'image/jpeg' || file.type === 'image/png'
      );
      if (selectedFiles.length === 0) {
        setError('Please upload JPG or PNG images only.');
      } else {
        setFiles(prev => [...prev, ...selectedFiles]);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const convertToPDF = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError('');

    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        let image;
        
        if (file.type === 'image/jpeg') {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          continue;
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted_images.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err: any) {
      console.error(err);
      setError('Failed to convert images to PDF. Ensure they are valid JPG/PNG files.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>JPG to PDF</h1>
        <p className={styles.subtitle}>Convert JPG images to PDF in seconds. Easily adjust orientation and margins.</p>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

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
            accept="image/jpeg, image/png" 
            ref={fileInputRef} 
            onChange={handleFileSelect}
            style={{ display: 'none' }} 
          />
          <ImageIcon className={styles.icon} />
          <button className={styles.uploadBtn}>Select JPG images</button>
          <p>or drop images here</p>
        </div>
      ) : (
        <div className={styles.editor}>
          <div className={styles.fileHeader}>
            <div className={styles.fileName}>{files.length} images selected</div>
            <button 
              className={styles.uploadBtn} 
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              onClick={() => fileInputRef.current?.click()}
            >
              + Add more
            </button>
            <input 
              type="file" 
              multiple
              accept="image/jpeg, image/png" 
              ref={fileInputRef} 
              onChange={handleFileSelect}
              style={{ display: 'none' }} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {files.map((file, index) => (
              <div key={index} style={{ position: 'relative', aspectRatio: '1', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                {/* We use an object URL to preview the image */}
                <img src={URL.createObjectURL(file)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', padding: '2px' }}
                  onClick={() => removeFile(index)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button 
              className={styles.actionBtn} 
              onClick={convertToPDF} 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 className="animate-spin" /> Converting...
                </span>
              ) : 'Convert to PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
