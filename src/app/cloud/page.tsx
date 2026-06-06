'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Cloud, AlertCircle } from 'lucide-react';
import Script from 'next/script';
import styles from '../server-tool.module.css';
import dashboardStyles from '../dashboard/page.module.css';
import RazorpayButton from "@/components/RazorpayButton";

export default function CloudIntegrations() {
  const { data: session, status } = useSession();
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    // Preload the Google Picker API so it's instantly ready
    const loadGapi = () => {
      const gapi = (window as any).gapi;
      if (gapi) {
        gapi.load('picker', () => console.log('Google Picker API loaded'));
      }
    };
    
    // Check periodically in case the script tag loads slightly after component mount
    const interval = setInterval(() => {
      if ((window as any).gapi) {
        loadGapi();
        clearInterval(interval);
      }
    }, 500);

  }, []);

  if (status === 'loading') {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5rem' }}>Loading secure cloud environments...</div>;
  }

  if (status === 'unauthenticated') {
    return <div style={{ textAlign: 'center', marginTop: '5rem' }}>Please log in to access Cloud Integrations.</div>;
  }

  const handleDropboxConnect = () => {
    if (!process.env.NEXT_PUBLIC_DROPBOX_APP_KEY) {
      alert("Developer Note: Missing NEXT_PUBLIC_DROPBOX_APP_KEY in .env.local");
      return;
    }

    const Dropbox = (window as any).Dropbox;
    if (!Dropbox) {
      alert("Dropbox SDK failed to load. Please check your internet connection or adblocker.");
      return;
    }

    Dropbox.choose({
      success: async function(files: any) {
        setConnecting('Dropbox');
        try {
          const res = await fetch('/api/cloud-import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: 'dropbox',
              fileName: files[0].name,
              url: files[0].link
            })
          });
          const data = await res.json();
          if (data.success) {
            alert('Success! File imported directly to your Cloud Dashboard.');
          } else {
            alert(`Error: ${data.error}`);
          }
        } catch (e: any) {
          alert(`Error importing file: ${e.message}`);
        } finally {
          setConnecting(null);
        }
      },
      linkType: "direct", // Requests a direct download URL from Dropbox
      multiselect: false,
      extensions: ['.pdf'],
    });
  };

  const handleGoogleConnect = () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || !process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      alert("Developer Note: Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID or NEXT_PUBLIC_GOOGLE_API_KEY in .env.local");
      return;
    }

    const gapi = (window as any).gapi;
    const google = (window as any).google;

    if (!gapi || !google || !google.accounts) {
      alert("Google SDK failed to load. Please check your internet connection or adblocker.");
      return;
    }

    setConnecting('Google Drive');

    // 1. Request OAuth Token safely via popup
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      callback: (response: any) => {
        if (response.error !== undefined) {
          setConnecting(null);
          alert(`Google Auth Error: ${response.error}`);
          return;
        }
        
        // 2. Open Google Picker UI
        const view = new google.picker.DocsView(google.picker.ViewId.DOCS);
        view.setMimeTypes('application/pdf');
        
        const picker = new google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(response.access_token)
            .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string)
            .setCallback(async (data: any) => {
              if (data.action == google.picker.Action.PICKED) {
                const doc = data.docs[0];
                try {
                  setConnecting('Google Drive (Importing...)');
                  // 3. Send credentials to backend to download the file directly from Google's servers
                  const res = await fetch('/api/cloud-import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      provider: 'google',
                      fileName: doc.name,
                      fileId: doc.id,
                      accessToken: response.access_token
                    })
                  });
                  const json = await res.json();
                  if (json.success) {
                    alert('Success! File imported directly to your Cloud Dashboard.');
                  } else {
                    alert(`Error: ${json.error}`);
                  }
                } catch (e: any) {
                  alert(`Error importing file: ${e.message}`);
                } finally {
                  setConnecting(null);
                }
              } else if (data.action === google.picker.Action.CANCEL) {
                setConnecting(null);
              }
            })
            .build();
        picker.setVisible(true);
      },
    });

    tokenClient.requestAccessToken({ prompt: '' });
  };

  return (
    <>
      {/* Official Drop-in SDKs */}
      <Script src="https://apis.google.com/js/api.js" strategy="lazyOnload" />
      <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />
      <Script 
        src="https://www.dropbox.com/static/api/2/dropins.js" 
        id="dropboxjs" 
        data-app-key={process.env.NEXT_PUBLIC_DROPBOX_APP_KEY || 'placeholder'} 
        strategy="lazyOnload" 
      />

      <div className={styles.container} style={{ maxWidth: '800px' }}>
        <div className={styles.header}>
          <h1 className={styles.title}>Cloud Integrations</h1>
          <p className={styles.subtitle}>Connect your favorite cloud storage providers to import files directly into your dashboard.</p>
        </div>

        {session?.user && !(session.user as any).isPremium ? (
          <div className={dashboardStyles.premiumLock}>
            <h2>Premium Feature</h2>
            <p>Cloud Integrations are only available to Premium users.</p>
            <p>Get a 1-Month Pass to unlock direct cloud imports!</p>
            <RazorpayButton email={session.user.email || ""} name={session.user.name || ""} />
          </div>
        ) : (
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
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Import files directly from Google Drive</p>
              </div>
            </div>
            <button 
              onClick={handleGoogleConnect}
              disabled={!!connecting}
              style={{
                padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-full)',
                background: connecting === 'Google Drive' || connecting === 'Google Drive (Importing...)' ? 'var(--border-color)' : 'var(--primary)',
                color: connecting === 'Google Drive' || connecting === 'Google Drive (Importing...)' ? 'var(--text-main)' : 'white',
                border: 'none', fontWeight: 600, cursor: !!connecting ? 'wait' : 'pointer',
                transition: 'background 0.2s ease'
              }}
            >
              {connecting === 'Google Drive' ? 'Authenticating...' : connecting === 'Google Drive (Importing...)' ? 'Importing...' : 'Connect'}
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
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Import files directly from Dropbox</p>
              </div>
            </div>
            <button 
              onClick={handleDropboxConnect}
              disabled={!!connecting}
              style={{
                padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-full)',
                background: connecting === 'Dropbox' ? 'var(--border-color)' : 'var(--primary)',
                color: connecting === 'Dropbox' ? 'var(--text-main)' : 'white',
                border: 'none', fontWeight: 600, cursor: !!connecting ? 'wait' : 'pointer',
                transition: 'background 0.2s ease'
              }}
            >
              {connecting === 'Dropbox' ? 'Importing...' : 'Connect'}
            </button>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem' }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
              <strong>Developer Note:</strong> OAuth configurations are required. Please set <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>, <code>NEXT_PUBLIC_GOOGLE_API_KEY</code>, and <code>NEXT_PUBLIC_DROPBOX_APP_KEY</code> in your environment variables.
            </p>
          </div>

        </div>
        )}
      </div>
    </>
  );
}
