import { useState } from 'react';
import { api } from '../api/client';
import { useStudioStore } from '../store/useStudioStore';

export function TrainingPanel() {
  const [taskId, setTaskId] = useState<string>();
  const [status, setStatus] = useState<any>();
  const pushLog = useStudioStore((s) => s.pushLog);
  const pushToast = useStudioStore((s) => s.pushToast);

  const start = async () => {
    try {
      const res = await api.post('/lora/train', {
        project_id: 'demo-project',
        dataset_manifest: 'demo/projects/demo-project/datasets/train/manifest.jsonl',
        lora_name: 'falcon_gt_angle_front',
        config: {
          base_model: 'sdxl-base',
          resolution: 1024,
          batch_size: 2,
          epochs: 5,
          learning_rate: 0.0001,
          lr_schedule: 'cosine',
          captioning_method: 'template',
          passes_used: ['beauty', 'depth', 'masks'],
        },
      });
      setTaskId(res.data.task_id);
      pushLog(`Training task queued: ${res.data.task_id}`);
      pushToast('success', 'LoRA training started.');
    } catch {
      pushLog('Training start failed (backend may be offline)');
      pushToast('error', 'Unable to start training.');
    }
  };

  const poll = async () => {
    if (!taskId) return;
    const res = await api.get(`/lora/train/${taskId}/status`);
    setStatus(res.data);
  };

  return (
    <section className="training-panel">
      <h3>LoRA Training</h3>
      <div className="row">
        <button onClick={start}>Start Training</button>
        <button onClick={poll} disabled={!taskId}>Poll Status</button>
      </div>
      <p className="muted">Base model, resolution, batch, epochs, LR schedule, captioning + conditioning passes are persisted per version.</p>
      {status && (
        <div className="status-card">
          <div>State: {status.state}</div>
          <div>Step: {status.step}/{status.total_steps}</div>
          <div>Loss: {status.loss}</div>
          <div>ETA: {status.eta_seconds}s</div>
          <div>GPU/CPU: {JSON.stringify(status.gpu_usage)}</div>
          <div>Checkpoints: {status.checkpoints?.length || 0}</div>
        </div>
      )}
    </section>
  );
}
