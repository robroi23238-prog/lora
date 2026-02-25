import { useStudioStore } from '../store/useStudioStore';

export function TopBar() {
  const runState = useStudioStore((s) => s.runState);
  const setRunState = useStudioStore((s) => s.setRunState);
  const pushLog = useStudioStore((s) => s.pushLog);

  const run = () => {
    setRunState('running');
    pushLog('Graph run started with per-node cache enabled');
  };

  return (
    <div className="topbar">
      <strong>LoRA Studio Desktop</strong>
      <div className="run-controls">
        <button onClick={run}>Run</button>
        <button onClick={() => setRunState('paused')}>Pause</button>
        <button onClick={() => setRunState('running')}>Resume</button>
        <button onClick={() => setRunState('cancelled')}>Cancel</button>
      </div>
      <span className="pill">{runState.toUpperCase()}</span>
    </div>
  );
}
