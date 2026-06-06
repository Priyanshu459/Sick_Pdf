'use client';

import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import { FileText, Download, Trash2, UploadCloud, Loader2 } from "lucide-react";

interface CloudFile {
  id: string;
  name: string;
  url: string;
  date: string;
  size: number;
}

export default function DashboardClient() {
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch files on load
  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cloudinary');
      const data = await res.json();
      if (data.success) {
        setFiles(data.files);
      } else {
        setError(data.error || "Failed to load files.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred loading your files.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (file.type !== "application/pdf") {
      alert("Only PDF files are supported!");
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) {
      alert("File too large. Maximum size is 50MB.");
      return;
    }

    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/cloudinary', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        await fetchFiles(); // Refresh list
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err: any) {
      alert("An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (publicId: string) => {
    if (!confirm("Are you sure you want to permanently delete this file from the cloud?")) return;
    
    try {
      const res = await fetch('/api/cloudinary', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: publicId })
      });
      const data = await res.json();
      if (data.success) {
        // Remove from UI instantly
        setFiles(files.filter(f => f.id !== publicId));
      } else {
        alert(data.error || "Failed to delete file.");
      }
    } catch (err) {
      alert("An error occurred while deleting.");
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Upload Zone */}
      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        style={{
          border: '2px dashed var(--border-color)',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
          cursor: isUploading ? 'wait' : 'pointer',
          background: 'var(--card-bg)',
          marginBottom: '2rem',
          transition: 'all 0.2s',
          opacity: isUploading ? 0.6 : 1
        }}
      >
        <input 
          type="file" 
          accept="application/pdf" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleUpload}
        />
        {isUploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--primary-color)' }}>
            <Loader2 size={48} className="animate-spin" />
            <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Uploading to Cloud...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
            <UploadCloud size={48} />
            <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Click or Drag PDF to Upload</p>
            <p style={{ fontSize: '0.9rem' }}>Securely back up your files to your personal cloud</p>
          </div>
        )}
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        <>
          <section className={styles.pdfGrid}>
            {files.map((pdf) => (
              <div key={pdf.id} className={styles.pdfCard}>
                <div className={styles.pdfIconWrapper}>
                  <FileText className={styles.pdfIcon} />
                </div>
                <div className={styles.pdfInfo}>
                  <h3 className={styles.pdfName} title={pdf.name}>{pdf.name}</h3>
                  <p className={styles.pdfDate}>{pdf.date}</p>
                </div>
                <div className={styles.pdfActions}>
                  <a 
                    href={pdf.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.actionBtn} 
                    title="Download/View"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Download size={18} />
                  </a>
                  <button 
                    onClick={() => handleDelete(pdf.id)} 
                    className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </section>

          {files.length === 0 && (
            <div className={styles.emptyState}>
              <p>You haven't uploaded any PDFs to your cloud yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
