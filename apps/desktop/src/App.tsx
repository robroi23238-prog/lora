import { BackgroundIntegrationPanel } from './components/BackgroundIntegrationPanel';
import { InspectorPanel } from './components/InspectorPanel';
import { LogsPanel } from './components/LogsPanel';
import { NodeGraphCanvas } from './components/NodeGraphCanvas';
import { NodePalette } from './components/NodePalette';
import { ProjectExplorer } from './components/ProjectExplorer';
import { TopBar } from './components/TopBar';
import { TrainingPanel } from './components/TrainingPanel';
import { ToastStack } from './components/ToastStack';

export default function App() {
  return (
    <div className="app-shell">
      <TopBar />
      <div className="workspace">
        <ProjectExplorer />
        <main className="graph-stack">
          <NodePalette />
          <NodeGraphCanvas />
          <div className="bottom-cards">
            <TrainingPanel />
            <BackgroundIntegrationPanel />
          </div>
        </main>
        <InspectorPanel />
      </div>
      <LogsPanel />
      <ToastStack />
    </div>
  );
}
