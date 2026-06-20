'use client';

import { useState } from 'react';
import { Globe, FileCode, Loader2, ArrowRight } from 'lucide-react';
import styles from '../../server-tool.module.css';

export default function HtmlToPdfClient() {
  const [inputType, setInputType] = useState<'url' | 'html'>('url');
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const processConversion = async () => {
    if (!content.trim()) {
      setError(`Please enter a valid ${inputType === 'url' ? 'URL' : 'HTML snippet'}`);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/convert/html-to-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: inputType, content }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Conversion failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `webpage.pdf`;
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
        <h1 className={styles.title}>HTML to PDF</h1>
        <p className={styles.subtitle}>Convert webpages or raw HTML code into a high-quality PDF document.</p>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.editor}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button 
            onClick={() => { setInputType('url'); setContent(''); setError(''); }}
            style={{ 
              flex: 1, padding: '0.75rem', borderRadius: '0.5rem', 
              backgroundColor: inputType === 'url' ? 'var(--primary)' : 'var(--bg-secondary)',
              color: inputType === 'url' ? 'white' : 'var(--text-primary)',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}
          >
            <Globe size={20} /> URL to PDF
          </button>
          <button 
            onClick={() => { setInputType('html'); setContent(''); setError(''); }}
            style={{ 
              flex: 1, padding: '0.75rem', borderRadius: '0.5rem', 
              backgroundColor: inputType === 'html' ? 'var(--primary)' : 'var(--bg-secondary)',
              color: inputType === 'html' ? 'white' : 'var(--text-primary)',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}
          >
            <FileCode size={20} /> HTML Code to PDF
          </button>
        </div>

        {inputType === 'url' ? (
          <input 
            type="url" 
            placeholder="https://example.com" 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ 
              width: '100%', padding: '1rem', borderRadius: '0.5rem', 
              border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', 
              color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '1.5rem'
            }}
          />
        ) : (
          <textarea 
            placeholder="<h1>Hello World</h1>" 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ 
              width: '100%', padding: '1rem', borderRadius: '0.5rem', 
              border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', 
              color: 'var(--text-primary)', fontSize: '1rem', minHeight: '200px',
              fontFamily: 'monospace', marginBottom: '1.5rem'
            }}
          />
        )}

        <div className={styles.actions}>
          <button 
            className={styles.actionBtn} 
            onClick={processConversion} 
            disabled={isProcessing || !content.trim()}
          >
            {isProcessing ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Loader2 className="animate-spin" /> Converting...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Convert to PDF <ArrowRight size={20} />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
