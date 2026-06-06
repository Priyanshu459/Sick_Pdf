export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Privacy Policy</h1>
      <p>Last updated: June 7, 2026</p>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>1. Introduction</h2>
        <p>Welcome to PDF Master. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.</p>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>2. Google Drive Data Usage</h2>
        <p>PDF Master utilizes the Google Drive API to allow you to seamlessly import your PDF files directly into our application.</p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li><strong>Access:</strong> We request read-only access to your Google Drive files exclusively for the purpose of allowing you to select and import a PDF.</li>
          <li><strong>Use:</strong> The imported file is immediately transferred to your secure, private Cloudinary storage folder for your use within the app.</li>
          <li><strong>Storage:</strong> We do not permanently store your Google Drive files on our primary application servers. Files are temporarily processed in memory and securely transferred to your connected cloud storage.</li>
          <li><strong>Sharing:</strong> We <strong>never</strong> sell, share, or distribute your Google user data or files to any third parties under any circumstances.</li>
        </ul>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>3. Data Retention</h2>
        <p>Your files remain in your secure cloud dashboard until you explicitly choose to delete them. You can delete your imported files at any time by navigating to your Cloud Dashboard and clicking the "Trash" icon.</p>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>4. Security</h2>
        <p>We use industry-standard security measures, including SSL encryption, to ensure your files and OAuth tokens remain completely secure during transmission.</p>
      </section>

    </div>
  );
}
