import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Environment, Float, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Delivery } from '../types';

interface Cricket3DViewProps {
  delivery: Delivery | null;
  isPlaying: boolean;
  currentTime: number;
}

function TrajectoryPath({ trajectory, color = "#39FF14", progress = 1 }: { trajectory: { x: number; y: number; z: number }[], color?: string, progress?: number }) {
  const points = useMemo(() => {
    // Only take points up to current progress
    const sliceIndex = Math.max(2, Math.floor(progress * trajectory.length));
    return trajectory.slice(0, sliceIndex).map(p => new THREE.Vector3(p.z * 5, p.y * 2, p.x));
  }, [trajectory, progress]);

  const curve = useMemo(() => {
    if (points.length < 2) return null;
    return new THREE.CatmullRomCurve3(points);
  }, [points]);
  
  if (!curve) return null;

  return (
    <mesh>
      <tubeGeometry args={[curve, 64, 0.05, 8, false]} />
      <meshStandardMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
}

function Ball({ delivery, isPlaying, currentTime }: { delivery: Delivery; isPlaying: boolean; currentTime: number }) {
  const ballRef = useRef<THREE.Mesh>(null);
  const trajectory = delivery.trajectory3D || [];
  const points = useMemo(() => {
    if (trajectory.length === 0) return [new THREE.Vector3(0, 0, 0)];
    return trajectory.map(p => new THREE.Vector3(p.z * 5, p.y * 2, p.x));
  }, [trajectory]);

  // Calculate relative time from delivery start
  const relativeTime = Math.max(0, currentTime - delivery.startTime);
  const animationDuration = 2.5; // Total animation length in seconds
  const progress = Math.min(relativeTime / animationDuration, 1);

  useFrame(() => {
    if (!ballRef.current || points.length < 2) return;
    
    const index = Math.floor(progress * (points.length - 1));
    const nextIndex = Math.min(index + 1, points.length - 1);
    const alpha = (progress * (points.length - 1)) - index;
    
    ballRef.current.position.lerpVectors(points[index], points[nextIndex], alpha);
    
    if (progress > 0 && progress < 1) {
      ballRef.current.rotation.x += 0.3;
      ballRef.current.rotation.y += 0.3;
    }
  });

  return (
    <group>
      {progress > 0 && (
        <mesh ref={ballRef}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial color="#ef4444" roughness={0.1} metalness={0.8} />
          <pointLight intensity={1} distance={5} color="#ef4444" />
        </mesh>
      )}
      <TrajectoryPath 
        trajectory={trajectory} 
        color={delivery.isWide || delivery.isNoBall ? "#ef4444" : "#39FF14"} 
        progress={progress}
      />
      
      {/* Analysis Markers in 3D - Only show when reached */}
      {relativeTime >= (delivery.events?.release || 0) && points[0] && (
        <group position={[points[0].x, points[0].y, points[0].z]}>
          <mesh>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} />
          </mesh>
          <Html distanceFactor={10}>
            <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded border border-blue-500/50 text-[8px] font-black text-blue-500 whitespace-nowrap">
              RELEASE
            </div>
          </Html>
        </group>
      )}

      {relativeTime >= (delivery.events?.bounce || 0) && points[10] && (
        <group position={[points[10].x, 0.05, points[10].z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.4, 32]} />
            <meshStandardMaterial color="#facc15" transparent opacity={0.8} />
          </mesh>
          <Html distanceFactor={10}>
            <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded border border-yellow-500/50 text-[8px] font-black text-yellow-500 whitespace-nowrap">
              BOUNCE: {delivery.type}
            </div>
          </Html>
        </group>
      )}

      {relativeTime >= (delivery.events?.impact || 0) && points[18] && (
        <group position={[points[18].x, points[18].y, points[18].z]}>
          <mesh>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
          </mesh>
          {/* Shot Direction Line */}
          <mesh position={[0, 0, -2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 4]} />
            <meshStandardMaterial color="#39FF14" transparent opacity={0.6} />
          </mesh>
          <Html distanceFactor={10}>
            <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded border border-red-500/50 text-[8px] font-black text-red-500 whitespace-nowrap">
              IMPACT: {delivery.batsmanAnalysis.shotType}
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

function Pitch() {
  return (
    <group>
      {/* Grass with texture simulation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 120]} />
        <meshStandardMaterial color="#064e3b" roughness={1} />
      </mesh>
      
      {/* Pitch - Dirt/Clay texture color */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[3.05, 20.12]} />
        <meshStandardMaterial color="#d4c4a1" roughness={0.8} />
      </mesh>

      {/* Crease Lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 10]}>
        <planeGeometry args={[3.05, 0.12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -10]}>
        <planeGeometry args={[3.05, 0.12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Stumps - Realistic Cylinder */}
      {[[-10.06, "#facc15"], [10.06, "#facc15"]].map(([z, color], idx) => (
        <group key={idx} position={[0, 0.35, z as number]}>
          <mesh position={[-0.11, 0, 0]} castShadow><cylinderGeometry args={[0.02, 0.02, 0.7]} /><meshStandardMaterial color={color as string} /></mesh>
          <mesh position={[0, 0, 0]} castShadow><cylinderGeometry args={[0.02, 0.02, 0.7]} /><meshStandardMaterial color={color as string} /></mesh>
          <mesh position={[0.11, 0, 0]} castShadow><cylinderGeometry args={[0.02, 0.02, 0.7]} /><meshStandardMaterial color={color as string} /></mesh>
          {/* Bails */}
          <mesh position={[0, 0.36, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.015, 0.015, 0.24]} /><meshStandardMaterial color={color as string} /></mesh>
        </group>
      ))}
    </group>
  );
}

function Player({ position, color, label, hasBat, analysis }: { position: [number, number, number], color: string, label: string, hasBat?: boolean, analysis?: any }) {
  return (
    <group position={position}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
        {/* Body */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <capsuleGeometry args={[0.22, 0.8, 4, 12]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.55, 0]} castShadow>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        {/* Bat */}
        {hasBat && (
          <mesh position={[0.35, 0.5, 0.2]} rotation={[0.6, 0.2, -0.3]} castShadow>
            <boxGeometry args={[0.12, 0.85, 0.06]} />
            <meshStandardMaterial color="#78350f" roughness={0.4} />
          </mesh>
        )}
        
        {/* Analysis HUD above player */}
        <Html position={[0, 2.2, 0]} center>
          <div className="flex flex-col items-center gap-1 pointer-events-none">
            <div className="bg-black/90 backdrop-blur-xl px-3 py-1 rounded-full border border-white/20 shadow-2xl">
              <span className="text-[10px] font-black text-white tracking-widest uppercase">{label}</span>
            </div>
            {analysis && (
              <div className="bg-neon/10 backdrop-blur-md px-2 py-1 rounded border border-neon/30 animate-in fade-in zoom-in duration-300">
                <span className="text-[8px] font-bold text-neon uppercase">{analysis.style || analysis.shotType}</span>
              </div>
            )}
          </div>
        </Html>
      </Float>
    </group>
  );
}

export default function Cricket3DView({ delivery, isPlaying, currentTime }: Cricket3DViewProps) {
  const timestamp = useMemo(() => {
    if (!delivery) return "";
    const date = new Date(delivery.timestamp);
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${Math.floor(Math.random() * 1000)}`;
  }, [delivery]);

  return (
    <div className="w-full h-full bg-slate-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group">
      {/* HUD Overlays */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
        <Badge className="bg-neon text-black font-black px-3 py-1 shadow-[0_0_20px_rgba(57,255,20,0.3)]">
          AI SPATIAL RECONSTRUCTION
        </Badge>
        {delivery && (
          <div className="glass p-3 rounded-xl border-white/10 flex flex-col gap-1 animate-in slide-in-from-left duration-500">
            <div className="flex items-center justify-between gap-8">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Ball Speed</span>
              <span className="text-sm font-black text-white">{delivery.speed} KM/H</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Timestamp</span>
              <span className="text-[10px] font-mono text-neon">{timestamp}</span>
            </div>
          </div>
        )}
      </div>

      <div className="absolute top-6 right-6 z-10">
        {delivery && (
          <div className="glass p-3 rounded-xl border-white/10 text-right animate-in slide-in-from-right duration-500">
            <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Live Telemetry</div>
            <div className="text-xs font-black text-white">SWING: {delivery.movement?.swing || 0}°</div>
            <div className="text-xs font-black text-yellow-400">SPIN: {delivery.movement?.spin || 0}°</div>
          </div>
        )}
      </div>
      
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[12, 8, 22]} fov={45} />
        <OrbitControls 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2.1} 
          minDistance={10}
          maxDistance={40}
          autoRotate={!isPlaying}
          autoRotateSpeed={0.5}
        />
        
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        />
        <spotLight position={[-15, 25, 15]} angle={0.3} penumbra={1} intensity={1} castShadow />
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
        <Environment preset="night" />

        <Pitch />
        
        {/* Batsman */}
        <Player 
          position={[0, 0, -10.5]} 
          color="#3b82f6" 
          label="BATSMAN" 
          hasBat 
          analysis={delivery?.batsmanAnalysis}
        />
        
        {/* Bowler */}
        <Player 
          position={[0, 0, 11]} 
          color="#ef4444" 
          label="BOWLER" 
        />

        {delivery && (
          <Ball delivery={delivery} isPlaying={isPlaying} currentTime={currentTime} />
        )}

        <gridHelper args={[100, 40, 0x39FF14, 0x1a1a1a]} position={[0, -0.02, 0]} />
        <fog attach="fog" args={['#020617', 30, 90]} />
      </Canvas>
      
      <div className="absolute bottom-6 left-6 z-10">
        <div className="glass px-3 py-1.5 rounded-full border-white/10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
          <span className="text-[10px] font-black text-white tracking-widest uppercase">
            {isPlaying ? "Rendering Live Trajectory" : "Scene Idle"}
          </span>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-widest ${className}`}>
      {children}
    </span>
  );
}
