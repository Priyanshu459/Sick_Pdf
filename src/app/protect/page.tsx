'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Lock, X, Loader2 } from 'lucide-react';
import styles from '../server-tool.module.css';

export default function ProtectPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const protectPDF = async () => {
    if (!file) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 3) {
      setError('Password must be at least 3 characters long.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', password);

      const response = await fetch('/api/protect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to protect PDF');
      }

      // Handle file download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `protected_${file.name}`;
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
        <h1 className={styles.title}>Protect PDF file</h1>
        <p className={styles.subtitle}>Encrypt your PDF with a password to keep sensitive data confidential.</p>
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
          <Lock className={styles.icon} />
          <button className={styles.uploadBtn}>Select PDF file</button>
          <p>or drop a PDF here</p>
        </div>
      ) : (
        <div className={styles.editor}>
          <div className={styles.fileHeader}>
            <div className={styles.fileName}>{file.name}</div>
            <button 
              style={{ color: 'var(--text-muted)', padding: '0.5rem' }} 
              onClick={() => { setFile(null); setPassword(''); setConfirmPassword(''); }}
            >
              <X size={24} />
            </button>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Type a password</label>
            <input 
              type="password" 
              className={styles.input} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Repeat password</label>
            <input 
              type="password" 
              className={styles.input} 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
            />
          </div>

          <div className={styles.actions}>
            <button 
              className={styles.actionBtn} 
              onClick={protectPDF} 
              disabled={isProcessing || !password || !confirmPassword}
            >
              {isProcessing ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 className="animate-spin" /> Protecting...
                </span>
              ) : 'Protect PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
