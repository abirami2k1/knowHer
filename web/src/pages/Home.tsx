import { useHealth } from '@/hooks/useHealth';

function statusLabel(health: ReturnType<typeof useHealth>): { text: string; tone: string } {
  if (health.isPending) return { text: 'Checking…', tone: 'text-muted' };
  if (health.isError) return { text: 'Unreachable — is the API running?', tone: 'text-primary' };
  return { text: `Connected · ${health.data.status}`, tone: 'text-calm' };
}

export default function Home() {
  const health = useHealth();
  const status = statusLabel(health);

  return (
    <section aria-labelledby="home-title" className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-muted">Welcome to</p>
        <h1 id="home-title" className="text-3xl font-semibold tracking-tight text-primary">
          knowHer
        </h1>
        <p className="text-muted">A warm, fearless companion for your cycle.</p>
      </header>

      <div className="rounded-card bg-white p-4 shadow-sm ring-1 ring-primary/5">
        <h2 className="text-sm font-medium text-muted">API status</h2>
        <p role="status" aria-live="polite" className={`mt-1 text-lg font-medium ${status.tone}`}>
          {status.text}
        </p>
      </div>
    </section>
  );
}
