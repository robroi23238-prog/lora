import { useStudioStore } from '../store/useStudioStore';

const sections = ['Datasets', 'Camera rigs', 'LoRA Library', 'Graphs', 'Outputs'];

export function ProjectExplorer() {
  const name = useStudioStore((s) => s.projectName);
  return (
    <aside className="panel explorer">
      <h2>{name}</h2>
      <p className="muted">Model: Falcon EV / trims: Sport, GT, Launch</p>
      {sections.map((section) => (
        <div key={section} className="section-group">
          <h3>{section}</h3>
          <ul>
            <li>{section === 'Graphs' ? 'master_workflow.json' : `demo-${section.toLowerCase().replace(/\s+/g, '-')}`}</li>
          </ul>
        </div>
      ))}
    </aside>
  );
}
