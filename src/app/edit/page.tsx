import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('./Editor'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', fontFamily: 'sans-serif' }}>
      <h2>Loading Editor Workspace...</h2>
    </div>
  )
});

export default function EditPage() {
  return <Editor />;
}
