import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Edges } from '@react-three/drei';
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
    position: [12.5, -20, 35], 
    title: 'Vértice Lobera Sur-Este',
    depth: '-20.0m',
    status: 'optimal',
    description: 'Tensión de red envolvente óptima en vértice de fondo.',
    component: 'Red Lobera Envolvente'
  },
  {
    id: 2,
    position: [-5.5, -18.5, 16.5], 
    title: 'Colector de Mortandad',
    depth: '-18.5m',
    status: 'warning',
    description: 'Acumulación moderada detectada en embudo colector.',
    component: 'Sistema de Mortandad'
  },
  {
    id: 3,
    position: [0, -20, -35],
    title: 'Fondo Lobera Norte',
    depth: '-20.0m',
    status: 'critical',
    description: 'Rotura detectada en el paño de fondo envolvente.',
    component: 'Red Lobera Envolvente'
  },
  {
    id: 4,
    position: [-60, -50, -33],
    title: 'Anclaje Fondeo Nor-Oeste',
    depth: '-50.0m',
    status: 'optimal',
    description: 'Bloque de concreto (muerto) estable y sin desplazamiento.',
    component: 'Sistema de Fondeo'
  }
];

const WaterPlane = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[1000, 1000]} />
      <meshBasicMaterial 
        color="#0ea5e9" 
        transparent 
        opacity={0.15} 
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

const Cage = ({ x, z }: { x: number, z: number }) => {
  return (
    <group>
      {/* Top Box part (Y: 0 to -12) */}
      <mesh position={[x, -6, z]}>
        <boxGeometry args={[10, 12, 10]} />
        <meshPhysicalMaterial color="#1e40af" transmission={0.6} opacity={0.8} transparent roughness={0.2} side={THREE.DoubleSide} />
        <Edges scale={1.0} threshold={15} color="#000000" />
      </mesh>
      
      {/* Bottom Pyramid part (Y: -12 to -18) */}
      <mesh position={[x, -15, z]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[7.07, 1, 6, 4]} />
        <meshPhysicalMaterial color="#1e40af" transmission={0.6} opacity={0.8} transparent roughness={0.2} side={THREE.DoubleSide} />
        <Edges scale={1.0} threshold={15} color="#000000" />
      </mesh>
      
      {/* Mortandad Top Ring */}
      <mesh position={[x, 1, z]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.15, 8, 24]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[x, 1, z]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 3]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[x, 1, z]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 3]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Mortandad Tube */}
      <mesh position={[x, -8.5, z]}>
        <cylinderGeometry args={[0.2, 0.2, 19, 8]} />
        <meshStandardMaterial color="#06b6d4" />
      </mesh>
      
      {/* Mortandad Funnel */}
      <mesh position={[x, -18.5, z]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1.8, 2, 16]} />
        <meshStandardMaterial color="#06b6d4" side={THREE.DoubleSide} />
        <Edges scale={1.0} threshold={15} color="#0891b2" />
      </mesh>
    </group>
  );
};

const SERVIROVCageModule = ({ markers, activeMarkerId, onMarkerClick }: { markers: FindingMarker[], activeMarkerId: number | null, onMarkerClick: (id: number) => void }) => {
  
  const { cages, mooring, weights, walkways, rails, pajareras } = useMemo(() => {
    // 1. Walkways & Rails
    const w = [];
    const r = [];
    
    // Z-directed walkways (X = -11, 0, 11)
    [-11, 0, 11].forEach(x => {
      w.push({ pos: [x, 0.2, 0], args: [1, 0.4, 67] });
      r.push({ pos: [x - 0.4, 0.7, 0], args: [0.05, 0.6, 67] });
      r.push({ pos: [x + 0.4, 0.7, 0], args: [0.05, 0.6, 67] });
    });
    
    // X-directed walkways
    [-33, -22, -11, 0, 11, 22, 33].forEach(z => {
      w.push({ pos: [0, 0.2, z], args: [23, 0.4, 1] });
      r.push({ pos: [0, 0.7, z - 0.4], args: [23, 0.6, 0.05] });
      r.push({ pos: [0, 0.7, z + 0.4], args: [23, 0.6, 0.05] });
    });

    // 2. Cages (2 hileras de 6 jaulas = 12 peceras) y Pajareras (techo red)
    const c = [];
    const p = [];
    [-5.5, 5.5].forEach(x => {
      [-27.5, -16.5, -5.5, 5.5, 16.5, 27.5].forEach(z => {
        c.push([x, z]);

        // Pajarera frame (pirámide superior)
        const top = new THREE.Vector3(x, 4, z);
        const corners = [
          new THREE.Vector3(x - 5, 0, z - 5),
          new THREE.Vector3(x + 5, 0, z - 5),
          new THREE.Vector3(x + 5, 0, z + 5),
          new THREE.Vector3(x - 5, 0, z + 5)
        ];
        
        const pts = [];
        corners.forEach(corner => {
          pts.push(corner, top);
        });
        for (let j = 0; j < 4; j++) {
          pts.push(corners[j], corners[(j + 1) % 4]);
        }
        p.push(new THREE.BufferGeometry().setFromPoints(pts));
      });
    });

    // 6. Mooring (Boyas, Líneas, Muertos expandidos)
    const mooringPositions = [];
    [-33, -16.5, 0, 16.5, 33].forEach(z => {
      mooringPositions.push({
        start: [-11, 0.5, z], buoy1: [-25, 0, z], buoy2: [-40, 0, z], anchor: [-60, -50, z]
      });
      mooringPositions.push({
        start: [11, 0.5, z], buoy1: [25, 0, z], buoy2: [40, 0, z], anchor: [60, -50, z]
      });
    });
    [-11, 0, 11].forEach(x => {
      mooringPositions.push({
        start: [x, 0.5, -33], buoy1: [x, 0, -45], buoy2: [x, 0, -60], anchor: [x, -50, -80]
      });
      mooringPositions.push({
        start: [x, 0.5, 33], buoy1: [x, 0, 45], buoy2: [x, 0, 60], anchor: [x, -50, 80]
      });
    });
    
    // 5. Weights (Contrapesos) at bottom of lobería (Y = -20)
    const wt = [];
    for (let z = -35; z <= 35; z += 2.5) {
      wt.push([-12.5, -20, z]);
      wt.push([12.5, -20, z]);
    }
    for (let x = -10; x <= 10; x += 2.5) {
      wt.push([x, -20, -35]);
      wt.push([x, -20, 35]);
    }

    return { walkways: w, rails: r, cages: c, pajareras: p, mooring: mooringPositions, weights: wt };
  }, []);

  return (
    <group>
      {/* --- 1. PASARELAS Y ESTRUCTURA SUPERIOR --- */}
      <group>
        {walkways.map((wk, i) => (
          <mesh key={`wk-${i}`} position={wk.pos as [number, number, number]}>
            <boxGeometry args={wk.args as [number, number, number]} />
            <meshStandardMaterial color="#111827" roughness={0.8} />
          </mesh>
        ))}
        {rails.map((rl, i) => (
          <mesh key={`rl-${i}`} position={rl.pos as [number, number, number]}>
            <boxGeometry args={rl.args as [number, number, number]} />
            <meshStandardMaterial color="#1f2937" roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* --- ESTRUCTURA PAJARERAS --- */}
      <group>
        {pajareras.map((geo, i) => (
          <lineSegments key={`paj-${i}`} geometry={geo}>
            <lineBasicMaterial color="#000000" linewidth={2} />
          </lineSegments>
        ))}
      </group>

      {/* --- 2. TUBERÍAS Y COLECTORES & 3. PECERAS INTERIORES --- */}
      <group>
        {cages.map(([x, z], i) => (
          <Cage key={`cage-${i}`} x={x} z={z} />
        ))}
      </group>

      {/* --- 4. RED LOBERÍA ENVOLVENTE --- */}
      <mesh position={[0, -10, 0]}>
        <boxGeometry args={[25, 20, 70]} />
        <meshPhysicalMaterial 
          color="#0d9488" 
          transmission={0.8}
          opacity={0.4} 
          transparent 
          side={THREE.DoubleSide}
          roughness={0.5}
        />
        <Edges scale={1.0} threshold={15} color="#0f766e" />
      </mesh>

      {/* --- 5. CONTRAPESOS PERIMETRALES INFERIORES --- */}
      <group>
        {weights.map((pos, i) => (
          <mesh key={`wt-${i}`} position={pos as [number, number, number]}>
            <boxGeometry args={[0.8, 1.2, 0.8]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#ef4444" : "#f8fafc"} />
          </mesh>
        ))}
      </group>

      {/* --- 6. SISTEMA DE FONDEO Y ANCLAJES (Polos Verticales) --- */}
      <group>
        {mooring.map((m, i) => {
          return (
            <React.Fragment key={`moor-${i}`}>
              {/* Lines linking the buoys */}
              <line geometry={new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(...m.start),
                new THREE.Vector3(m.buoy1[0], 4, m.buoy1[2])
              ])}>
                <lineBasicMaterial color="#000000" />
              </line>
              <line geometry={new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(m.buoy1[0], 4, m.buoy1[2]),
                new THREE.Vector3(m.buoy2[0], 4, m.buoy2[2])
              ])}>
                <lineBasicMaterial color="#000000" />
              </line>
              <line geometry={new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(m.buoy2[0], 4, m.buoy2[2]),
                new THREE.Vector3(...m.anchor)
              ])}>
                <lineBasicMaterial color="#000000" />
              </line>
              
              {/* Pole 1 */}
              <mesh position={[m.buoy1[0], 2, m.buoy1[2]]}>
                <cylinderGeometry args={[0.15, 0.15, 4]} />
                <meshStandardMaterial color="#111827" />
              </mesh>
              <mesh position={[m.buoy1[0], 0, m.buoy1[2]]}>
                <sphereGeometry args={[0.6]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
              <mesh position={[m.buoy1[0], 4.5, m.buoy1[2]]}>
                <coneGeometry args={[0.8, 1.2, 16]} />
                <meshStandardMaterial color="#f97316" />
                <Edges color="#ea580c" />
              </mesh>
              
              {/* Pole 2 */}
              <mesh position={[m.buoy2[0], 2, m.buoy2[2]]}>
                <cylinderGeometry args={[0.15, 0.15, 4]} />
                <meshStandardMaterial color="#111827" />
              </mesh>
              <mesh position={[m.buoy2[0], 0, m.buoy2[2]]}>
                <sphereGeometry args={[0.6]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
              <mesh position={[m.buoy2[0], 4.5, m.buoy2[2]]}>
                <coneGeometry args={[0.8, 1.2, 16]} />
                <meshStandardMaterial color="#f97316" />
                <Edges color="#ea580c" />
              </mesh>

              {/* Anchor */}
              <mesh position={m.anchor as [number, number, number]}>
                <boxGeometry args={[4, 4, 4]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
                <Edges color="#94a3b8" />
              </mesh>
            </React.Fragment>
          );
        })}
      </group>

      {/* --- 7. PINES INTERACTIVOS (<Html>) --- */}
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
        camera={{ position: [80, 50, 100], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        className="cursor-move"
      >
        <color attach="background" args={['#0f172a']} />
        
        <ambientLight intensity={1.5} color="#ffffff" />
        <directionalLight position={[50, 100, 40]} intensity={1.5} color="#ffffff" />

        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 + 0.1} 
          minDistance={10}
          maxDistance={300}
        />

        <WaterPlane />
        <SERVIROVCageModule 
          markers={markers}
          activeMarkerId={activeMarkerId}
          onMarkerClick={handleMarkerClick}
        />
        
        <gridHelper args={[600, 60, '#1e293b', '#0f172a']} position={[0, -50, 0]} />
      </Canvas>

      {/* Overlay UI */}
      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 shadow-xl pointer-events-none w-72 z-10">
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
        <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-cyan-900/50 shadow-2xl animate-fade-in flex items-start gap-4 z-10">
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
