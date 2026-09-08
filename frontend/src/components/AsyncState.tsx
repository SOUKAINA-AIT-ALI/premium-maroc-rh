export const LoadingState = ({ label = 'Chargement...' }: { label?: string }) => (
  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }} role="status">
    <span style={{ display: 'inline-block', width: 20, height: 20, border: '2px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginRight: 8, verticalAlign: 'middle' }} />
    {label}
  </div>
);

export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div style={{ padding: '1rem', marginBottom: '1rem', color: 'var(--danger)', background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)' }} role="alert">
    {message}
    {onRetry && <button type="button" className="btn btn-secondary" onClick={onRetry} style={{ marginLeft: '1rem' }}>Réessayer</button>}
  </div>
);
