export default function BankLoading({ error, className }: { error: boolean; className?: string }) {
  return (
    <div className={className} style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
      {error ? '[!] Could not load the question bank. Please reload the page.' : 'Loading question bank...'}
    </div>
  );
}
