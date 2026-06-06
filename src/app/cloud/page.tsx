'use client';

import { useState } from 'react';
import { Cloud, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from '../server-tool.module.css';

export default function CloudIntegrations() {
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = (provider: string) => {
    setConnecting(provider);
    setTimeout(() => {
      alert(`${provider} requires OAuth API keys to be configured in the environment variables. Please set them up in your production deployment.`);
      setConnecting(null);
    }, 1500);
  };

  return (
    <div className={styles.container} style={{ maxWidth: '800px' }}>
      <div className={styles.header}>
        <h1 className={styles.title}>Cloud Integrations</h1>
        <p className={styles.subtitle}>Connect your favorite cloud storage providers to import and export files directly.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
        
        {/* Google Drive */}
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          background: 'var(--bg-main)', padding: '1.5rem', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', background: '#f8f9fa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.39 15.65L10.5 7.15L5.61 15.65H15.39ZM15.39 15.65H20.28L15.39 7.15V15.65ZM5.61 15.65L10.5 24.15L15.39 15.65H5.61ZM10.5 7.15L15.39 15.65L20.28 7.15H10.5ZM5.61 15.65H0.72L5.61 7.15V15.65Z" fill="#000" fillOpacity="0" />
                <path d="M15.207 14.542L11.597 8.35L8.006 14.542H15.207Z" fill="#FFC107"/>
                <path d="M11.597 8.35H18.799L15.207 14.542H8.006L11.597 8.35Z" fill="#1976D2"/>
                <path d="M15.207 14.542L18.799 8.35L22.39 14.542L18.799 20.733H11.597L15.207 14.542Z" fill="#4CAF50"/>
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Google Drive</h3>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Import and save files directly to Google Drive</p>
            </div>
          </div>
          <button 
            onClick={() => handleConnect('Google Drive')}
            style={{
              padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-full)',
              background: connecting === 'Google Drive' ? 'var(--border-color)' : 'var(--primary)',
              color: connecting === 'Google Drive' ? 'var(--text-main)' : 'white',
              border: 'none', fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
          >
            {connecting === 'Google Drive' ? 'Connecting...' : 'Connect'}
          </button>
        </div>

        {/* Dropbox */}
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          background: 'var(--bg-main)', padding: '1.5rem', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', background: '#0061FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cloud color="white" size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Dropbox</h3>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Import and save files directly to Dropbox</p>
            </div>
          </div>
          <button 
            onClick={() => handleConnect('Dropbox')}
            style={{
              padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-full)',
              background: connecting === 'Dropbox' ? 'var(--border-color)' : 'var(--primary)',
              color: connecting === 'Dropbox' ? 'var(--text-main)' : 'white',
              border: 'none', fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
          >
            {connecting === 'Dropbox' ? 'Connecting...' : 'Connect'}
          </button>
        </div>

        <div style={{ padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem' }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
            <strong>Developer Note:</strong> OAuth configurations are required to activate these cloud storage integrations. Please add your `GOOGLE_CLIENT_ID` and `DROPBOX_APP_KEY` to the `.env.local` file.
          </p>
        </div>

      </div>
    </div>
  );
}
