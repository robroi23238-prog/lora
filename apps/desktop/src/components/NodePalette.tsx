import { nodeCatalog } from '../data/nodeCatalog';
import { useStudioStore } from '../store/useStudioStore';

export function NodePalette() {
  const addNode = useStudioStore((s) => s.addNode);
  return (
    <div className="palette">
      <h3>Node Palette</h3>
      <div className="palette-list">
        {nodeCatalog.map((node) => (
          <button key={node.type} className="palette-item" onClick={() => addNode(node.type)}>
            <strong>{node.title}</strong>
            <span>{node.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
