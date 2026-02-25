import { z } from 'zod';

export const SchemaVersion = z.literal('1.0.0');

export const PassPathsSchema = z.object({
  beauty: z.string(),
  depth: z.string().optional(),
  normals: z.string().optional(),
  masks: z.string().optional(),
  materialIds: z.string().optional(),
});

export const DatasetRecordSchema = z.object({
  id: z.string(),
  imagePath: z.string(),
  caption: z.string(),
  split: z.enum(['train', 'val']),
  tags: z.array(z.string()),
  camera: z.record(z.any()).default({}),
  passes: PassPathsSchema,
  metadata: z.record(z.any()).default({}),
});

export const CameraRigSchema = z.object({
  id: z.string(),
  name: z.string(),
  schemaVersion: SchemaVersion,
  focalLength: z.number(),
  sensorWidth: z.number(),
  aperture: z.number(),
  focusDistance: z.number(),
  nearClip: z.number(),
  farClip: z.number(),
  dof: z.boolean(),
  position: z.tuple([z.number(), z.number(), z.number()]),
  target: z.tuple([z.number(), z.number(), z.number()]),
  preset: z.string().optional(),
});

export const NodePortSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['image', 'mask', 'depth', 'text', 'metadata', 'model']),
});

export const GraphNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  inputs: z.array(NodePortSchema),
  outputs: z.array(NodePortSchema),
  config: z.record(z.any()).default({}),
  cacheEnabled: z.boolean().default(true),
});

export const GraphEdgeSchema = z.object({
  id: z.string(),
  sourceNodeId: z.string(),
  sourcePortId: z.string(),
  targetNodeId: z.string(),
  targetPortId: z.string(),
});

export const NodeGraphSchema = z.object({
  id: z.string(),
  name: z.string(),
  schemaVersion: SchemaVersion,
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
  viewport: z.object({ x: z.number(), y: z.number(), zoom: z.number() }).default({ x: 0, y: 0, zoom: 1 }),
});

export const LoRAVersionSchema = z.object({
  id: z.string(),
  schemaVersion: SchemaVersion,
  name: z.string(),
  carModel: z.string(),
  trim: z.string().optional(),
  angleFamily: z.string().optional(),
  checkpointPath: z.string(),
  createdAt: z.string(),
  trainingConfig: z.record(z.any()),
  metrics: z.record(z.any()).default({}),
});

export const ProjectSchema = z.object({
  id: z.string(),
  schemaVersion: SchemaVersion,
  name: z.string(),
  rootDir: z.string(),
  car: z.object({
    model: z.string(),
    year: z.number(),
    platform: z.string(),
    trims: z.array(z.string()),
  }),
  renderFolders: z.array(z.string()),
  datasets: z.array(z.string()),
  cameraRigs: z.array(z.string()),
  graphs: z.array(z.string()),
  loraVersions: z.array(LoRAVersionSchema),
  outputs: z.array(z.string()),
});

export type Project = z.infer<typeof ProjectSchema>;
export type NodeGraph = z.infer<typeof NodeGraphSchema>;
export type CameraRig = z.infer<typeof CameraRigSchema>;
export type DatasetRecord = z.infer<typeof DatasetRecordSchema>;
export type LoRAVersion = z.infer<typeof LoRAVersionSchema>;

export const AdapterBackgroundRequestSchema = z.object({
  prompt: z.string(),
  negativePrompt: z.string().optional(),
  stylePreset: z.string(),
  resolution: z.object({ width: z.number(), height: z.number() }),
  seed: z.number().optional(),
  variants: z.number().min(1).max(8).default(1),
});

export const AdapterBackgroundResponseSchema = z.object({
  images: z.array(z.object({ path: z.string(), seed: z.number(), metadata: z.record(z.any()) })),
  provider: z.string(),
});
