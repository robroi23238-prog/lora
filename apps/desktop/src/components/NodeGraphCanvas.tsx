import { memo, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  addEdge,
  Connection,
  Edge,
  Node,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStudioStore } from '../store/useStudioStore';

const GraphNode = memo(({ data }: { data: any }) => (
  <div className={`graph-node status-${data.status || 'idle'}`}>
    <header>{data.label}</header>
    <div className="ports">
      <div>
        {data.inputs.map((port: any, idx: number) => (
          <div className="port-row" key={port.id}>
            <Handle id={port.id} type="target" position={Position.Left} style={{ top: 32 + idx * 22 }} />
            <span>{port.name}</span>
          </div>
        ))}
      </div>
      <div>
        {data.outputs.map((port: any, idx: number) => (
          <div className="port-row right" key={port.id}>
            <span>{port.name}</span>
            <Handle id={port.id} type="source" position={Position.Right} style={{ top: 32 + idx * 22 }} />
          </div>
        ))}
      </div>
    </div>
    {data.error && <p className="error">{data.error}</p>}
  </div>
));

const nodeTypes = { studioNode: GraphNode };

export function NodeGraphCanvas() {
  const storeNodes = useStudioStore((s) => s.nodes);
  const storeEdges = useStudioStore((s) => s.edges);
  const setStoreNodes = useStudioStore((s) => s.setNodes);
  const setStoreEdges = useStudioStore((s) => s.setEdges);
  const selectNode = useStudioStore((s) => s.selectNode);
  const pushLog = useStudioStore((s) => s.pushLog);

  const initialNodes = useMemo<Node[]>(
    () =>
      storeNodes.map((node) => ({
        id: node.id,
        type: 'studioNode',
        position: node.position,
        data: { label: node.title, inputs: node.inputs, outputs: node.outputs, status: node.status, error: node.error },
      })),
    [storeNodes],
  );

  const initialEdges = useMemo<Edge[]>(
    () =>
      storeEdges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        sourceHandle: edge.sourceHandle,
        target: edge.target,
        targetHandle: edge.targetHandle,
      })),
    [storeEdges],
  );

  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const validateConnection = (connection: Connection) => {
    const source = storeNodes.find((n) => n.id === connection.source);
    const target = storeNodes.find((n) => n.id === connection.target);
    const out = source?.outputs.find((p) => p.id === connection.sourceHandle);
    const input = target?.inputs.find((p) => p.id === connection.targetHandle);
    if (!out || !input) {
      pushLog('⚠ Invalid connection: missing port');
      return false;
    }
    if (out.type !== input.type) {
      pushLog(`❌ Port type mismatch ${out.type} -> ${input.type}`);
      return false;
    }
    return true;
  };

  const onConnect = (conn: Connection) => {
    if (!validateConnection(conn)) return;
    const next = addEdge(conn, edges);
    setEdges(next);
    setStoreEdges(
      next.map((edge) => ({
        id: edge.id,
        source: edge.source,
        sourceHandle: edge.sourceHandle || '',
        target: edge.target,
        targetHandle: edge.targetHandle || '',
      })),
    );
    pushLog(`Connected ${conn.source}:${conn.sourceHandle} -> ${conn.target}:${conn.targetHandle}`);
  };

  return (
    <div className="graph-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          onNodesChange(changes);
          const next = nodes.map((n) => ({ ...n }));
          setStoreNodes(
            next.map((n) => ({
              ...storeNodes.find((sn) => sn.id === n.id)!,
              position: n.position,
            })),
          );
        }}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => selectNode(node.id)}
        fitView
        nodeTypes={nodeTypes}
      >
        <Background color="#1a2233" gap={20} />
        <MiniMap pannable zoomable />
        <Controls />
      </ReactFlow>
    </div>
  );
}
