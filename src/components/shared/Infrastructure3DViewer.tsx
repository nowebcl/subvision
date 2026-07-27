import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ShieldAlert, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export interface FindingMarker {
  id: number;
  position: [number, number, number];
  title: string;
  depth: string;
  status: 'optimal' | 'warning' | 'critical';
  description: string;
  component: string;
}

const defaultMarkers: FindingMarker[] = [
  {
    id: 1,
    position: [12.5, -40, 6.5], 
    title: 'Vértice Lobera Sur-Este',
    depth: '-40.0m',
    status: 'optimal',
    description: 'Tensión de red envolvente óptima en vértice de fondo.',
    component: 'Red Lobera Envolvente'
  },
  {
    id: 2,
    position: [-5.5, -15, 5], 
    title: 'Pared Oeste Pecera 101',
    depth: '-15.0m',
    status: 'warning',
    description: 'Desgaste moderado y presencia de biofouling.',
    component: 'Red Pecera Interior'
  },
  {
    id: 3,
    position: [0, -40, -6.5],
    title: 'Fondo Lobera Norte',
    depth: '-40.0m',
    status: 'critical',
    description: 'Rotura detectada en el paño de fondo envolvente.',
    component: 'Red Lobera Envolvente'
  },
  {
    id: 4,
    position: [-12.5, 0, -6.5],
    title: 'Tensión Fondeo Norte-Oeste',
    depth: '0.0m',
    status: 'optimal',
    description: 'Línea de fondeo operando dentro de los rangos de tensión.',
    component: 'Sistema de Fondeo'
  }
];

const WaterPlane = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[1000, 1000]} />
      <meshBasicMaterial 
        color="#0284c7" 
        transparent 
        opacity={0.25} 
        side={THREE.DoubleSide} 
        depthWrite={false} 
      />
    </mesh>
  );
};

const MarkerLabel = ({ marker, onClick, isActive }: { marker: FindingMarker, onClick: () => void, isActive: boolean }) => {
  return (
    <Html center distanceFactor={15} zIndexRange={[100, 0]}>
      <div 
        className={`relative cursor-pointer transition-all duration-300 group ${isActive ? 'scale-125 z-50' : 'scale-100 hover:scale-110 z-10'}`}
        onClick={onClick}
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg bg-slate-900 border-2 border-cyan-400 shadow-cyan-500/50`}>
          {marker.id}
        </div>
        
        {/* Tooltip on hover/active */}
        <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 rounded-xl bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 shadow-2xl transition-all duration-200 pointer-events-none ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}`}>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <span className="font-bold text-white text-xs">{marker.title}</span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-900/30 px-1.5 py-0.5 rounded">{marker.depth}</span>
          </div>
          <div className="text-[10px] text-slate-300 mb-2 leading-tight">
            {marker.description}
          </div>
          <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-slate-500">
            <Info className="w-3 h-3" />
            <span>{marker.component}</span>
          </div>
        </div>
      </div>
    </Html>
  );
};

const SERVIROVCageModule = ({ markers, activeMarkerId, onMarkerClick }: { markers: FindingMarker[], activeMarkerId: number | null, onMarkerClick: (id: number) => void }) => {
  
  const { pajareraGeo, mooringLines } = useMemo(() => {
    // Pajarera Wireframe (Y=0.4 to 3.0)
    const pGeo = new THREE.BufferGeometry();
    const pPts = [
      new THREE.Vector3(-12.5, 0.4, -6.5), new THREE.Vector3(0, 3.0, 0),
      new THREE.Vector3(12.5, 0.4, -6.5), new THREE.Vector3(0, 3.0, 0),
      new THREE.Vector3(12.5, 0.4, 6.5), new THREE.Vector3(0, 3.0, 0),
      new THREE.Vector3(-12.5, 0.4, 6.5), new THREE.Vector3(0, 3.0, 0),
      new THREE.Vector3(-12.5, 0.4, -6.5), new THREE.Vector3(12.5, 0.4, -6.5),
      new THREE.Vector3(12.5, 0.4, -6.5), new THREE.Vector3(12.5, 0.4, 6.5),
      new THREE.Vector3(12.5, 0.4, 6.5), new THREE.Vector3(-12.5, 0.4, 6.5),
      new THREE.Vector3(-12.5, 0.4, 6.5), new THREE.Vector3(-12.5, 0.4, -6.5),
    ];
    pGeo.setFromPoints(pPts);

    const mLines = [
      [[-12.5, 0, -6.5], [-30, -50, -30]],
      [[12.5, 0, -6.5], [30, -50, -30]],
      [[-12.5, 0, 6.5], [-30, -50, 30]],
      [[12.5, 0, 6.5], [30, -50, 30]]
    ];

    return { pajareraGeo: pGeo, mooringLines: mLines };
  }, []);

  return (
    <group>
      {/* --- 1. ESTRUCTURAS EN SUPERFICIE (Y > 0) --- */}
      
      {/* Pasarelas Perimetrales (Y = +0.2) */}
      <mesh position={[0, 0.2, -6.5]}>
        <boxGeometry args={[26, 0.4, 1]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.2, 6.5]}>
        <boxGeometry args={[26, 0.4, 1]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      <mesh position={[-12.5, 0.2, 0]}>
        <boxGeometry args={[1, 0.4, 14]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      <mesh position={[12.5, 0.2, 0]}>
        <boxGeometry args={[1, 0.4, 14]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1, 0.4, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>

      {/* Boyas de flotación Perimetrales */}
      {[-12.5, 0, 12.5].map((xPos) => (
        [-6.5, 6.5].map((zPos) => (
          <mesh key={`buoy-${xPos}-${zPos}`} position={[xPos, 0.5, zPos]}>
            <cylinderGeometry args={[0.6, 0.3, 0.8, 16]} />
            <meshStandardMaterial color="#f97316" roughness={0.4} />
          </mesh>
        ))
      ))}
      {[-6, 6].map((xPos) => (
        [-6.5, 6.5].map((zPos) => (
          <mesh key={`buoy-mid-${xPos}-${zPos}`} position={[xPos, 0.5, zPos]}>
            <cylinderGeometry args={[0.6, 0.3, 0.8, 16]} />
            <meshStandardMaterial color="#f97316" roughness={0.4} />
          </mesh>
        ))
      ))}

      {/* Red Pajarera (Techo Y = 0.4 a 3.0) */}
      <lineSegments position={[0, 0, 0]} geometry={pajareraGeo}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </lineSegments>

      {/* --- 2. ESTRUCTURAS SUBMARINAS (Y < 0) --- */}
      
      {/* REDES PECERAS INTERIORES (Y = -10, size = 10x20x10) */}
      <group position={[-5.5, -10, 0]}>
        <mesh>
          <boxGeometry args={[10, 20, 10]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.6} />
        </mesh>
      </group>
      <group position={[5.5, -10, 0]}>
        <mesh>
          <boxGeometry args={[10, 20, 10]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.6} />
        </mesh>
      </group>

      {/* RED LOBERÍA ENVOLVENTE (Y = -20, size = 25x40x13) */}
      {/* REQUISITO CRÍTICO: VISIBLE Y LUMINOSA, wireframe cyan brillante */}
      <group position={[0, -20, 0]}>
        <mesh>
          <boxGeometry args={[25, 40, 13]} />
          <meshBasicMaterial 
            color="#22d3ee" 
            wireframe
            transparent 
            opacity={0.35} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      </group>

      {/* SISTEMA DE FONDEO (Líneas y Muertos a Y = -50) */}
      {mooringLines.map((linePts, idx) => {
        const points = linePts.map(p => new THREE.Vector3(p[0], p[1], p[2]));
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <React.Fragment key={`mooring-${idx}`}>
            <line geometry={geo}>
              <lineBasicMaterial color="#ef4444" linewidth={2} />
            </line>
            <mesh position={linePts[1] as [number, number, number]}>
              <boxGeometry args={[4, 4, 4]} />
              <meshStandardMaterial color="#334155" roughness={0.9} />
            </mesh>
          </React.Fragment>
        );
      })}

      {/* --- 3. MARCADORES / HALLAZGOS --- */}
      {markers.map((marker) => (
        <group key={marker.id} position={marker.position}>
          <MarkerLabel 
            marker={marker} 
            isActive={activeMarkerId === marker.id}
            onClick={() => onMarkerClick(marker.id)}
          />
        </group>
      ))}
    </group>
  );
};

export const Infrastructure3DViewer: React.FC<{
  markers?: FindingMarker[];
  onMarkerClick?: (id: number) => void;
}> = ({ markers = defaultMarkers, onMarkerClick }) => {
  const [activeMarkerId, setActiveMarkerId] = useState<number | null>(null);

  const handleMarkerClick = (id: number) => {
    setActiveMarkerId(id === activeMarkerId ? null : id);
    if (onMarkerClick) onMarkerClick(id);
  };

  const activeMarker = useMemo(() => markers.find(m => m.id === activeMarkerId), [markers, activeMarkerId]);

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800">
      <Canvas
        camera={{ position: [30, 20, 40], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        className="cursor-move"
      >
        <color attach="background" args={['#050b18']} />
        
        <ambientLight intensity={1.5} color="#ffffff" />
        <directionalLight position={[50, 100, 40]} intensity={1.5} color="#ffffff" />

        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 + 0.1} 
          minDistance={10}
          maxDistance={200}
        />

        <WaterPlane />
        <SERVIROVCageModule 
          markers={markers}
          activeMarkerId={activeMarkerId}
          onMarkerClick={handleMarkerClick}
        />
        
        <gridHelper args={[400, 40, '#0e2b5c', '#0b1c3c']} position={[0, -50, 0]} />
      </Canvas>

      {/* Overlay UI */}
      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 shadow-xl pointer-events-none w-72">
        <h3 className="text-white font-bold mb-1 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          Telemetría 3D SERVIROV
        </h3>
        <p className="text-slate-400 text-xs mb-4">Inspección Submarina Activa</p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Estado Óptimo
            </span>
            <span className="font-mono text-slate-400">{markers.filter(m => m.status === 'optimal').length}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              Advertencias
            </span>
            <span className="font-mono text-slate-400">{markers.filter(m => m.status === 'warning').length}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              Críticos
            </span>
            <span className="font-mono text-slate-400">{markers.filter(m => m.status === 'critical').length}</span>
          </div>
        </div>
      </div>

      {activeMarker && (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-cyan-900/50 shadow-2xl animate-fade-in flex items-start gap-4">
          <div className={`mt-1 shrink-0 ${activeMarker.status === 'optimal' ? 'text-emerald-500' : activeMarker.status === 'warning' ? 'text-amber-500' : 'text-red-500'}`}>
            {activeMarker.status === 'optimal' ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-white font-bold text-lg">{activeMarker.title}</h4>
              <span className="px-2 py-1 rounded bg-slate-800 text-cyan-400 text-xs font-mono font-bold">Z: {activeMarker.depth}</span>
            </div>
            <p className="text-slate-300 text-sm mb-2">{activeMarker.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">Componente Inspector: {activeMarker.component}</span>
            </div>
          </div>
          <button 
            onClick={() => setActiveMarkerId(null)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Cerrar detalle"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
