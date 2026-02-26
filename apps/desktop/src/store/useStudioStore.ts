import { create } from 'zustand';
import { nodeCatalog } from '../data/nodeCatalog';

export interface StudioNode {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  inputs: { id: string; name: string; type: string }[];
  outputs: { id: string; name: string; type: string }[];
  config: Record<string, unknown>;
  status?: 'idle' | 'running' | 'success' | 'error';
  error?: string;
}

export interface StudioEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

type RunState = 'idle' | 'running' | 'paused' | 'cancelled';

interface StudioState {
  projectId: string;
  projectName: string;
  nodes: StudioNode[];
  edges: StudioEdge[];
  selectedNodeId?: string;
  runState: RunState;
  logs: string[];
  toasts: { id: string; kind: 'success' | 'error'; message: string }[];
  addNode: (type: string) => void;
  setNodes: (nodes: StudioNode[]) => void;
  setEdges: (edges: StudioEdge[]) => void;
  selectNode: (id?: string) => void;
  updateNodeConfig: (nodeId: string, key: string, value: unknown) => void;
  pushLog: (line: string) => void;
  setRunState: (state: RunState) => void;
  pushToast: (kind: 'success' | 'error', message: string) => void;
  removeToast: (id: string) => void;
}

const seedNodes: StudioNode[] = [
  'ImportCADRendersNode',
  'DatasetBuilderNode',
  'LoRATrainingNode',
  'LoRALibraryNode',
  'PromptComposerNode',
  'BackgroundGenNode',
  'IntegrationCompositeNode',
  'OutputNode',
].map((type, idx) => {
  const template = nodeCatalog.find((item) => item.type === type)!;
  return {
    id: `${type}_${idx}`,
    type,
    title: template.title,
    position: { x: 60 + idx * 240, y: 140 + (idx % 2) * 140 },
    inputs: template.inputs,
    outputs: template.outputs,
    config: template.defaultConfig,
    status: 'idle',
  };
});

const seedEdges: StudioEdge[] = [
  { id: 'e1', source: 'ImportCADRendersNode_0', sourceHandle: 'beauty', target: 'IntegrationCompositeNode_6', targetHandle: 'car' },
  { id: 'e2', source: 'ImportCADRendersNode_0', sourceHandle: 'mask', target: 'IntegrationCompositeNode_6', targetHandle: 'mask' },
  { id: 'e3', source: 'PromptComposerNode_4', sourceHandle: 'prompt', target: 'BackgroundGenNode_5', targetHandle: 'prompt' },
  { id: 'e4', source: 'BackgroundGenNode_5', sourceHandle: 'bg', target: 'IntegrationCompositeNode_6', targetHandle: 'bg' },
  { id: 'e5', source: 'IntegrationCompositeNode_6', sourceHandle: 'integrated', target: 'OutputNode_7', targetHandle: 'final' },
];

export const useStudioStore = create<StudioState>((set) => ({
  projectId: 'demo-project',
  projectName: 'Falcon EV 2026 Studio',
  nodes: seedNodes,
  edges: seedEdges,
  runState: 'idle',
  logs: ['Loaded demo graph v1.0.0', 'Mock backend available at http://localhost:8000'],
  toasts: [],
  addNode: (type) =>
    set((state) => {
      const template = nodeCatalog.find((item) => item.type === type);
      if (!template) return state;
      const node: StudioNode = {
        id: `${type}_${Date.now()}`,
        type,
        title: template.title,
        position: { x: 80, y: 80 },
        inputs: template.inputs,
        outputs: template.outputs,
        config: template.defaultConfig,
        status: 'idle',
      };
      return { nodes: [...state.nodes, node] };
    }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  selectNode: (id) => set({ selectedNodeId: id }),
  updateNodeConfig: (nodeId, key, value) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, config: { ...node.config, [key]: value } } : node,
      ),
    })),
  pushLog: (line) => set((state) => ({ logs: [`${new Date().toLocaleTimeString()} ${line}`, ...state.logs].slice(0, 200) })),
  setRunState: (runState) => set({ runState }),
  pushToast: (kind, message) => set((state) => ({ toasts: [...state.toasts, { id: `${Date.now()}`, kind, message }] })),
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}));
