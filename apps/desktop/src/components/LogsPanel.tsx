import { useStudioStore } from '../store/useStudioStore';

export function LogsPanel() {
  const logs = useStudioStore((s) => s.logs);
  return (
    <section className="logs-panel">
      <h3>Backend / Execution Logs</h3>
      <div className="logs-list">
        {logs.map((line, idx) => (
          <div key={`${line}-${idx}`}>{line}</div>
        ))}
      </div>
    </section>
  );
}
