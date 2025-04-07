export default function TestPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Test Page
      </h1>
      <p style={{ marginBottom: '1rem' }}>
        This is a simple test page to check CSS functionality.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
        <button className="btn btn-primary">Primary Button</button>
        <button className="btn btn-outline">Outline Button</button>
      </div>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Card Component
        </h2>
        <p>This is a card component using our CSS utilities.</p>
      </div>
    </div>
  );
} 