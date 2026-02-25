export type PortType = 'image' | 'mask' | 'depth' | 'text' | 'metadata' | 'model';

export interface NodeTemplate {
  type: string;
  title: string;
  description: string;
  inputs: { id: string; name: string; type: PortType }[];
  outputs: { id: string; name: string; type: PortType }[];
  defaultConfig: Record<string, unknown>;
}

export const nodeCatalog: NodeTemplate[] = [
  {
    type: 'ImportCADRendersNode',
    title: 'Import CAD Renders',
    description: 'Loads beauty/mask/depth/normal passes from local export folders.',
    inputs: [],
    outputs: [
      { id: 'beauty', name: 'Beauty', type: 'image' },
      { id: 'mask', name: 'Mask', type: 'mask' },
      { id: 'depth', name: 'Depth', type: 'depth' },
      { id: 'metadata', name: 'Metadata', type: 'metadata' },
    ],
    defaultConfig: { folder: 'demo/projects/demo-project/renders' },
  },
  {
    type: 'DatasetBuilderNode',
    title: 'Dataset Builder',
    description: 'Creates train/val manifests + captions + metadata JSONL.',
    inputs: [{ id: 'in_meta', name: 'Render Metadata', type: 'metadata' }],
    outputs: [{ id: 'dataset', name: 'Dataset Manifest', type: 'metadata' }],
    defaultConfig: { split: 0.9, captionMode: 'template' },
  },
  {
    type: 'CameraRigNode',
    title: 'Camera Rig',
    description: 'Select saved rigs and view presets.',
    inputs: [],
    outputs: [{ id: 'cam_meta', name: 'Camera Metadata', type: 'metadata' }],
    defaultConfig: { preset: 'Front 3/4', lens: 50 },
  },
  {
    type: 'RenderPreviewNode',
    title: 'Render Preview',
    description: 'Preview selected pass for current frame.',
    inputs: [
      { id: 'img', name: 'Image', type: 'image' },
      { id: 'depth', name: 'Depth', type: 'depth' },
    ],
    outputs: [{ id: 'preview', name: 'Preview', type: 'image' }],
    defaultConfig: { pass: 'beauty' },
  },
  {
    type: 'LoRATrainingNode',
    title: 'LoRA Training',
    description: 'Launch local LoRA task with progress and checkpoints.',
    inputs: [{ id: 'dataset', name: 'Dataset', type: 'metadata' }],
    outputs: [{ id: 'model', name: 'LoRA Checkpoint', type: 'model' }],
    defaultConfig: { baseModel: 'sdxl-base', epochs: 8, batchSize: 2 },
  },
  {
    type: 'LoRALibraryNode',
    title: 'LoRA Library',
    description: 'Blend multiple LoRA versions and merge strategies.',
    inputs: [{ id: 'lora', name: 'LoRA Model', type: 'model' }],
    outputs: [{ id: 'merged', name: 'Merged LoRA', type: 'model' }],
    defaultConfig: { strategy: 'weighted', weight: 0.7 },
  },
  {
    type: 'PromptComposerNode',
    title: 'Prompt Composer',
    description: 'Template prompts using {car_model}, {trim}, {angle}, {lens}.',
    inputs: [{ id: 'cam', name: 'Camera Metadata', type: 'metadata' }],
    outputs: [{ id: 'prompt', name: 'Prompt', type: 'text' }],
    defaultConfig: { template: 'A {car_model} {trim} photographed from {angle} at {lens}mm lens' },
  },
  {
    type: 'BackgroundGenNode',
    title: 'Background Gen',
    description: 'Calls Nano Banana Pro adapter (mock by default).',
    inputs: [{ id: 'prompt', name: 'Prompt', type: 'text' }],
    outputs: [{ id: 'bg', name: 'Background', type: 'image' }],
    defaultConfig: { style: 'authentic moments', variants: 4 },
  },
  {
    type: 'IntegrationCompositeNode',
    title: 'Integration Composite',
    description: 'Relight and color match car render into generated background.',
    inputs: [
      { id: 'car', name: 'Car Image', type: 'image' },
      { id: 'mask', name: 'Car Mask', type: 'mask' },
      { id: 'bg', name: 'Background', type: 'image' },
    ],
    outputs: [{ id: 'integrated', name: 'Integrated', type: 'image' }],
    defaultConfig: { contactShadow: 0.35, reflection: 0.2 },
  },
  {
    type: 'OutputNode',
    title: 'Output',
    description: 'Exports final image + sidecar JSON metadata.',
    inputs: [{ id: 'final', name: 'Final Image', type: 'image' }],
    outputs: [],
    defaultConfig: { format: 'png', sidecar: true },
  },
];
