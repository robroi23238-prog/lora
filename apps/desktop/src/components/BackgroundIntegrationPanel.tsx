import { useState } from 'react';
import { api } from '../api/client';
import { useStudioStore } from '../store/useStudioStore';

export function BackgroundIntegrationPanel() {
  const [prompt, setPrompt] = useState('A premium EV launch scene with cinematic dusk light and people in motion');
  const [style, setStyle] = useState('authentic moments');
  const [response, setResponse] = useState<any>();
  const pushLog = useStudioStore((s) => s.pushLog);
  const pushToast = useStudioStore((s) => s.pushToast);

  const generate = async () => {
    try {
      const res = await api.post('/generate/background', {
        prompt,
        style_preset: style,
        variants: 3,
        width: 1536,
        height: 1024,
      });
      setResponse(res.data);
      pushLog(`Generated ${res.data.images.length} mock Nano Banana backgrounds.`);
      pushToast('success', 'Background variants generated.');
    } catch {
      pushLog('Background generation failed (backend unavailable).');
      pushToast('error', 'Background generation failed.');
    }
  };

  return (
    <section className="integration-panel">
      <h3>Background & Integration</h3>
      <label className="field">
        <span>Prompt</span>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} />
      </label>
      <label className="field">
        <span>Style preset</span>
        <select value={style} onChange={(e) => setStyle(e.target.value)}>
          <option>rough look real but curated</option>
          <option>authentic moments</option>
          <option>more about people</option>
        </select>
      </label>
      <button onClick={generate}>Generate Background Variants</button>
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
    </section>
  );
}
