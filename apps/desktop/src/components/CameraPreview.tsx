import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

interface Props {
  focalLength: number;
  sensorWidth: number;
  aperture: number;
}

export function CameraPreview({ focalLength, sensorWidth, aperture }: Props) {
  return (
    <div className="camera-preview">
      <Canvas>
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} />
        <PerspectiveCamera makeDefault position={[4, 2, 6]} fov={35} />
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[3.6, 1.2, 1.6]} />
          <meshStandardMaterial color="#35526d" metalness={0.45} roughness={0.35} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#1a1d24" />
        </mesh>
        <OrbitControls target={[0, 0.5, 0]} />
      </Canvas>
      <div className="camera-overlay">
        <span>{focalLength}mm</span>
        <span>{sensorWidth}mm sensor</span>
        <span>f/{aperture}</span>
      </div>
    </div>
  );
}
