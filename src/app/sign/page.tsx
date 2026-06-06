'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { PenTool, X, Loader2, Upload } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import styles from '../server-tool.module.css';

export default function SignPDF() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

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
        setPdfFile(droppedFile);
      } else {
        setError('Please upload a valid PDF file.');
      }
    }
  };

  const handlePdfSelect = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setPdfFile(selectedFile);
      } else {
        setError('Please upload a valid PDF file.');
      }
    }
  };

  const handleSigSelect = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'image/png' || selectedFile.type === 'image/jpeg') {
        setSignatureFile(selectedFile);
      } else {
        setError('Please upload a valid PNG or JPG image for your signature.');
      }
    }
  };

  const signPDF = async () => {
    if (!pdfFile || !signatureFile) return;
    setIsProcessing(true);
    setError('');

    try {
      const pdfBuffer = await pdfFile.arrayBuffer();
      const sigBuffer = await signatureFile.arrayBuffer();
      
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      
      let sigImage;
      if (signatureFile.type === 'image/png') {
        sigImage = await pdfDoc.embedPng(sigBuffer);
      } else {
        sigImage = await pdfDoc.embedJpg(sigBuffer);
      }

      // Add signature to the last page at the bottom right
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      const { width, height } = lastPage.getSize();
      
      // Scale signature to a reasonable size (e.g. 150px wide)
      const sigDims = sigImage.scale(150 / sigImage.width);
      
      lastPage.drawImage(sigImage, {
        x: width - sigDims.width - 50,
        y: 50,
        width: sigDims.width,
        height: sigDims.height,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `signed_${pdfFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while signing the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Sign PDF</h1>
        <p className={styles.subtitle}>Upload your document and append your signature image to the last page.</p>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {!pdfFile ? (
        <div 
          className={`${styles.dropzone} ${isDragging ? styles.active : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => pdfInputRef.current?.click()}
        >
          <input 
            type="file" 
            accept="application/pdf" 
            ref={pdfInputRef} 
            onChange={handlePdfSelect}
            style={{ display: 'none' }} 
          />
          <PenTool className={styles.icon} />
          <button className={styles.uploadBtn}>Select PDF file</button>
          <p>or drop a PDF here</p>
        </div>
      ) : (
        <div className={styles.editor}>
          <div className={styles.fileHeader}>
            <div className={styles.fileName}>Document: {pdfFile.name}</div>
            <button 
              style={{ color: 'var(--text-muted)', padding: '0.5rem' }} 
              onClick={() => { setPdfFile(null); setSignatureFile(null); }}
            >
              <X size={24} />
            </button>
          </div>

          <div className={styles.inputGroup} style={{ marginTop: '2rem' }}>
            <label className={styles.label}>Signature Image (PNG/JPG)</label>
            
            {!signatureFile ? (
               <div 
                style={{ 
                  border: '1px dashed var(--border-color)', 
                  padding: '2rem', 
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => sigInputRef.current?.click()}
               >
                 <Upload size={24} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
                 <div>Click to upload signature image</div>
               </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <span className={styles.fileName}>{signatureFile.name}</span>
                <button onClick={() => setSignatureFile(null)} style={{ color: 'var(--danger)' }}><X size={20} /></button>
              </div>
            )}
            
            <input 
              type="file" 
              accept="image/png, image/jpeg" 
              ref={sigInputRef} 
              onChange={handleSigSelect}
              style={{ display: 'none' }} 
            />
          </div>

          <div className={styles.actions}>
            <button 
              className={styles.actionBtn} 
              onClick={signPDF} 
              disabled={isProcessing || !signatureFile}
            >
              {isProcessing ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 className="animate-spin" /> Signing...
                </span>
              ) : 'Sign PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
