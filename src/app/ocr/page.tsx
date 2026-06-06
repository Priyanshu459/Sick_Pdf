'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { ScanText, X, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import styles from '../server-tool.module.css';

export default function OCRTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [copied, setCopied] = useState(false);
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
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        setPreview(URL.createObjectURL(droppedFile));
        setExtractedText('');
      } else {
        setError('Please upload a valid image file (JPG, PNG). PDF OCR requires server-side rendering.');
      }
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setExtractedText('');
      } else {
        setError('Please upload a valid image file (JPG, PNG). PDF OCR requires server-side rendering.');
      }
    }
  };

  const processOCR = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setError('');
    setExtractedText('');

    try {
      const result = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          }
        }
      );
      setExtractedText(result.data.text);
    } catch (err: any) {
      console.error(err);
      setError('Failed to extract text from the image. Please try a clearer image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className={styles.container} style={{ maxWidth: '1000px' }}>
      <div className={styles.header}>
        <h1 className={styles.title}>OCR Image to Text</h1>
        <p className={styles.subtitle}>Convert scanned images to editable text formats using advanced Optical Character Recognition.</p>
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
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileSelect}
            style={{ display: 'none' }} 
          />
          <ScanText className={styles.icon} />
          <button className={styles.uploadBtn}>Select Image</button>
          <p>or drop an image here</p>
        </div>
      ) : (
        <div className={styles.editor}>
          <div className={styles.fileHeader}>
            <div className={styles.fileName}>{file.name}</div>
            <button 
              style={{ color: 'var(--text-muted)', padding: '0.5rem' }} 
              onClick={() => { setFile(null); setPreview(''); setExtractedText(''); }}
            >
              <X size={24} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '300px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src={preview} alt="Document preview" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }} />
              
              {!extractedText && (
                <button 
                  className={styles.actionBtn} 
                  style={{ marginTop: '2rem', width: '100%' }}
                  onClick={processOCR} 
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <Loader2 className="animate-spin" /> Extracting Text ({progress}%)
                    </span>
                  ) : 'Extract Text with OCR'}
                </button>
              )}
            </div>

            {extractedText && (
              <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Extracted Text</h3>
                  <button 
                    onClick={copyToClipboard}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.25rem',
                      background: 'none', border: 'none', color: copied ? 'var(--success)' : 'var(--primary)', 
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' 
                    }}
                  >
                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>
                <textarea 
                  value={extractedText}
                  readOnly
                  style={{
                    width: '100%',
                    height: '400px',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    resize: 'vertical'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
