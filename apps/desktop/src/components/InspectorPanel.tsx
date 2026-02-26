import { useMemo, useState } from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { CameraPreview } from './CameraPreview';

export function InspectorPanel() {
  const selectedNodeId = useStudioStore((s) => s.selectedNodeId);
  const nodes = useStudioStore((s) => s.nodes);
  const updateNodeConfig = useStudioStore((s) => s.updateNodeConfig);

  const node = useMemo(() => nodes.find((item) => item.id === selectedNodeId), [nodes, selectedNodeId]);
  const [focalLength, setFocalLength] = useState(50);
  const [sensorWidth, setSensorWidth] = useState(36);
  const [aperture, setAperture] = useState(4);

  return (
    <aside className="panel inspector">
      <h3>Properties</h3>
      {!node && <p className="muted">Select a node to inspect config and validation.</p>}
      {node && (
        <>
          <h4>{node.title}</h4>
          {Object.entries(node.config).map(([key, value]) => (
            <label key={key} className="field">
              <span>{key}</span>
              <input
                value={String(value)}
                onChange={(e) => updateNodeConfig(node.id, key, e.target.value)}
                aria-label={`${node.title}-${key}`}
              />
            </label>
          ))}
        </>
      )}

      <h3>3D Camera Preview</h3>
      <div className="camera-controls">
        <label>
          Focal Length
          <input type="range" min={18} max={120} value={focalLength} onChange={(e) => setFocalLength(Number(e.target.value))} />
        </label>
        <label>
          Sensor Width
          <input type="range" min={24} max={46} value={sensorWidth} onChange={(e) => setSensorWidth(Number(e.target.value))} />
        </label>
        <label>
          Aperture
          <input type="range" min={1.2} max={16} step={0.1} value={aperture} onChange={(e) => setAperture(Number(e.target.value))} />
        </label>
      </div>
      <CameraPreview focalLength={focalLength} sensorWidth={sensorWidth} aperture={aperture} />
      <p className="muted">Presets: Front 3/4, Rear 3/4, Side, Hero low angle</p>
    </aside>
  );
}
