const fs = require('fs');
const file = 'c:/Users/NOWEB  DESKTOP/Documents/PROYECTOS  ANTIGRAVITY/SUBVISION/src/components/shared/Infrastructure3DViewer.tsx';

const content = `import React, { useState, useMemo } from 'react';
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
    position: [13, -40, 24], 
    title: 'Vértice Lobera Sur-Este',
    depth: '-40.0m',
    status: 'optimal',
    description: 'Tensión de red envolvente óptima en vértice de fondo.',
    component: 'Red Lobera Envolvente'
  }
];

const WaterPlane = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[1200, 1200]} />
      <meshBasicMaterial 
        color="#38bdf8" 
        transparent 
        opacity={0.3} 
        side={THREE.DoubleSide} 
        depthWrite={false} 
      />
    </mesh>
  );
};

const MarkerLabel = ({ marker, onClick, isActive }: { marker: FindingMarker, onClick: () => void, isActive: boolean }) => {
  const bgColor = marker.status === 'optimal' ? 'bg-emerald-500' : marker.status === 'warning' ? 'bg-amber-500' : 'bg-red-500';
  const glowColor = marker.status === 'optimal' ? 'shadow-emerald-500/50' : marker.status === 'warning' ? 'shadow-amber-500/50' : 'shadow-red-500/50';

  return (
    <Html center distanceFactor={45} zIndexRange={[100, 0]}>
      <div 
        className={\`relative cursor-pointer transition-all duration-300 group \${isActive ? 'scale-125 z-50' : 'scale-100 hover:scale-110 z-10'}\`}
        onClick={onClick}
      >
        <div className={\`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white \${bgColor} \${glowColor}\`}>
          {marker.id}
        </div>
        
        {/* Tooltip */}
        <div className={\`absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-3 rounded-xl bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 shadow-2xl transition-all duration-200 pointer-events-none \${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}\`}>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <span className="font-bold text-white text-xs">{marker.title}</span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-900/30 px-1.5 py-0.5 rounded">{marker.depth}</span>
          </div>
          <div className="text-[10px] text-slate-300 mb-2 leading-tight">
            {marker.description}
          </div>
        </div>
      </div>
    </Html>
  );
};

const SERVIROVCageModule = ({ markers, activeMarkerId, onMarkerClick }: { markers: FindingMarker[], activeMarkerId: number | null, onMarkerClick: (id: number) => void }) => {
  const rows = 2;
  const cols = 5;
  const cageW = 22;
  const cageD = 22;
  const cageSpacing = 2; 
  const walkwayThick = 1.5;
  
  const offsetX = (cols * cageW + (cols-1)*cageSpacing) / 2;
  const offsetZ = (rows * cageD + (rows-1)*cageSpacing) / 2;

  // Memoize Geometries to avoid recreations
  const { pajareraGeo, netGeo, netEdgesGeo, buoys, weights, labels, gridLines, gridSpheres, mooringLines } = useMemo(() => {
    // 1. Pajarera (Pyramid)
    const pGeo = new THREE.BufferGeometry();
    const pHeight = 4;
    const pyY = walkwayThick/2;
    const pPts = [
      new THREE.Vector3(-cageW/2, pyY, -cageD/2), new THREE.Vector3(0, pyY+pHeight, 0),
      new THREE.Vector3(cageW/2, pyY, -cageD/2), new THREE.Vector3(0, pyY+pHeight, 0),
      new THREE.Vector3(cageW/2, pyY, cageD/2), new THREE.Vector3(0, pyY+pHeight, 0),
      new THREE.Vector3(-cageW/2, pyY, cageD/2), new THREE.Vector3(0, pyY+pHeight, 0),
      new THREE.Vector3(-cageW/2, pyY, -cageD/2), new THREE.Vector3(cageW/2, pyY, -cageD/2),
      new THREE.Vector3(cageW/2, pyY, -cageD/2), new THREE.Vector3(cageW/2, pyY, cageD/2),
      new THREE.Vector3(cageW/2, pyY, cageD/2), new THREE.Vector3(-cageW/2, pyY, cageD/2),
      new THREE.Vector3(-cageW/2, pyY, cageD/2), new THREE.Vector3(-cageW/2, pyY, -cageD/2),
    ];
    pGeo.setFromPoints(pPts);

    // 2. Net (Funnel shape)
    const netDepth1 = 12; // straight part
    const netDepth2 = 8;  // funnel part
    const bW = cageW * 0.4;
    
    const nGeo = new THREE.BufferGeometry();
    const v = [
      -cageW/2, 0, -cageD/2,   cageW/2, 0, -cageD/2,   cageW/2, 0, cageD/2,   -cageW/2, 0, cageD/2,
      -cageW/2, -netDepth1, -cageD/2,   cageW/2, -netDepth1, -cageD/2,   cageW/2, -netDepth1, cageD/2,   -cageW/2, -netDepth1, cageD/2,
      -bW/2, -netDepth1-netDepth2, -bW/2,   bW/2, -netDepth1-netDepth2, -bW/2,   bW/2, -netDepth1-netDepth2, bW/2,   -bW/2, -netDepth1-netDepth2, bW/2
    ];
    const vertices = new Float32Array(v);
    const indices = [
      0,1,5, 0,5,4, 1,2,6, 1,6,5, 2,3,7, 2,7,6, 3,0,4, 3,4,7,
      4,5,9, 4,9,8, 5,6,10, 5,10,9, 6,7,11, 6,11,10, 7,4,8, 7,8,11,
      8,9,10, 8,10,11
    ];
    nGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    nGeo.setIndex(indices);
    nGeo.computeVertexNormals();

    const nEdges = new THREE.EdgesGeometry(nGeo);

    // 3. Buoys Positions
    const bPositions = [];
    const boyaY = 7.5;
    for (let r = 0; r <= rows; r++) {
      const z = -offsetZ + r * (cageD + cageSpacing) - (r===0 ? 0 : cageSpacing/2);
      bPositions.push([-offsetX - 4, boyaY, z]);
      bPositions.push([offsetX + 4, boyaY, z]);
    }
    for (let c = 0; c <= cols; c++) {
      const x = -offsetX + c * (cageW + cageSpacing) - (c===0 ? 0 : cageSpacing/2);
      bPositions.push([x, boyaY, -offsetZ - 4]);
      bPositions.push([x, boyaY, offsetZ + 4]);
    }

    // 4. Weights Positions
    const wPositions = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = -offsetX + cageW/2 + c*(cageW+cageSpacing);
        const cz = -offsetZ + cageD/2 + r*(cageD+cageSpacing);
        
        const pts = [
          new THREE.Vector3(-bW/2, -netDepth1-netDepth2, -bW/2),
          new THREE.Vector3(bW/2, -netDepth1-netDepth2, -bW/2),
          new THREE.Vector3(bW/2, -netDepth1-netDepth2, bW/2),
          new THREE.Vector3(-bW/2, -netDepth1-netDepth2, bW/2)
        ];
        for(let i=0; i<4; i++) {
          const pA = pts[i];
          const pB = pts[(i+1)%4];
          for(let step=0; step<=3; step++) {
            if (step===3 && i<3) continue;
            const wPos = new THREE.Vector3().lerpVectors(pA, pB, step/3);
            wPositions.push([cx + wPos.x, wPos.y, cz + wPos.z]);
          }
        }
      }
    }

    // 5. Labels (Cage Numbers)
    const lbls = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = -offsetX + cageW/2 + c*(cageW+cageSpacing);
        const cz = -offsetZ + cageD/2 + r*(cageD+cageSpacing);
        const idStr = (100 + (r*cols + c + 1)).toString();
        lbls.push({ x: cx, y: 8.5, z: cz, id: idStr });
      }
    }

    // 6. Underwater Grid
    const gLines = [];
    const gSpheres = [];
    const gridY = -35;
    for(let x = -offsetX-20; x <= offsetX+20; x+=20) {
      gLines.push([[x, gridY, -offsetZ-20], [x, gridY, offsetZ+20]]);
    }
    for(let z = -offsetZ-20; z <= offsetZ+20; z+=20) {
      gLines.push([[-offsetX-20, gridY, z], [offsetX+20, gridY, z]]);
    }
    for(let x = -offsetX-20; x <= offsetX+20; x+=20) {
      for(let z = -offsetZ-20; z <= offsetZ+20; z+=20) {
        gSpheres.push([x, gridY, z]);
      }
    }

    // 7. Mooring Lines (Diagonales Rojas)
    const mLines = [
      [[-offsetX, 8, -offsetZ], [-offsetX-60, gridY, -offsetZ-60]],
      [[offsetX, 8, -offsetZ], [offsetX+60, gridY, -offsetZ-60]],
      [[-offsetX, 8, offsetZ], [-offsetX-60, gridY, offsetZ+60]],
      [[offsetX, 8, offsetZ], [offsetX+60, gridY, offsetZ+60]]
    ];

    return { 
      pajareraGeo: pGeo, netGeo: nGeo, netEdgesGeo: nEdges, 
      buoys: bPositions, weights: wPositions, labels: lbls,
      gridLines: gLines, gridSpheres: gSpheres, mooringLines: mLines
    };
  }, [rows, cols, cageW, cageD, cageSpacing, offsetX, offsetZ, walkwayThick]);

  // Cages array for iterations
  const cages = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = -offsetX + cageW/2 + c*(cageW+cageSpacing);
      const cz = -offsetZ + cageD/2 + r*(cageD+cageSpacing);
      cages.push({ r, c, cx, cz, id: 100 + (r*cols + c + 1) });
    }
  }

  // Walkways generator
  const hWalkways = [];
  const vWalkways = [];
  for (let r = 0; r <= rows; r++) {
    const z = -offsetZ + r * (cageD + cageSpacing) - (r===0 ? 0 : cageSpacing/2);
    hWalkways.push(z);
  }
  for (let c = 0; c <= cols; c++) {
    const x = -offsetX + c * (cageW + cageSpacing) - (c===0 ? 0 : cageSpacing/2);
    vWalkways.push(x);
  }

  return (
    <group>
      {/* 1. WALKWAYS (Y=8) */}
      {hWalkways.map((z, i) => (
        <mesh key={\`h-\${i}\`} position={[0, 8, z]}>
          <boxGeometry args={[offsetX * 2, walkwayThick, walkwayThick]} />
          <meshStandardMaterial color="#21252b" roughness={0.8} />
        </mesh>
      ))}
      {vWalkways.map((x, i) => (
        <mesh key={\`v-\${i}\`} position={[x, 8, 0]}>
          <boxGeometry args={[walkwayThick, walkwayThick, offsetZ * 2]} />
          <meshStandardMaterial color="#21252b" roughness={0.8} />
        </mesh>
      ))}

      {/* 2. CAGES (Pajareras + Nets) */}
      {cages.map((cage) => (
        <group key={\`cage-\${cage.id}\`} position={[cage.cx, 0, cage.cz]}>
          {/* Pajarera */}
          <lineSegments position={[0, 8, 0]} geometry={pajareraGeo}>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.4} />
          </lineSegments>
          
          {/* Net Mesh */}
          <mesh position={[0, 8, 0]} geometry={netGeo}>
            <meshBasicMaterial color="#0284c7" transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>

          {/* Net Wireframe */}
          <lineSegments position={[0, 8, 0]} geometry={netEdgesGeo}>
            <lineBasicMaterial color="#38bdf8" transparent opacity={0.4} />
          </lineSegments>
          
          {/* Label HTML instead of CanvasTexture for sharper rendering */}
          <Html position={[0, 8.5, 0]} center zIndexRange={[50, 0]} distanceFactor={30}>
            <div className="bg-slate-900/90 text-white font-mono font-bold border border-slate-700 px-3 py-1 rounded shadow-lg">
              {cage.id}
            </div>
          </Html>
        </group>
      ))}

      {/* 3. BUOYS */}
      {buoys.map((pos, i) => (
        <mesh key={\`buoy-\${i}\`} position={pos as [number, number, number]}>
          <cylinderGeometry args={[1.5, 1.0, 2.5, 16]} />
          <meshStandardMaterial color="#f97316" roughness={0.4} />
        </mesh>
      ))}

      {/* 4. RED WEIGHTS */}
      {weights.map((pos, i) => (
        <mesh key={\`weight-\${i}\`} position={pos as [number, number, number]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.8, 1.5, 8]} />
          <meshStandardMaterial color="#ef4444" roughness={0.5} />
        </mesh>
      ))}

      {/* 5. UNDERWATER GRID */}
      {gridLines.map((pts, i) => (
        <line key={\`gline-\${i}\`}>
          <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(...p)))} />
          <lineBasicMaterial color="#444444" transparent opacity={0.5} />
        </line>
      ))}
      {gridSpheres.map((pos, i) => (
        <mesh key={\`gsphere-\${i}\`} position={pos as [number, number, number]}>
          <sphereGeometry args={[1.2, 8, 8]} />
          <meshStandardMaterial color="#aaaaaa" roughness={0.6} />
        </mesh>
      ))}

      {/* 6. MOORING LINES & DEAD WEIGHTS */}
      {mooringLines.map((pts, i) => (
        <React.Fragment key={\`mooring-\${i}\`}>
          <line>
            <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(...p)))} />
            <lineBasicMaterial color="#ef4444" linewidth={2} />
          </line>
          <mesh position={pts[1] as [number, number, number]}>
            <boxGeometry args={[4, 4, 4]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>
        </React.Fragment>
      ))}

      {/* 7. MARKERS */}
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
        camera={{ position: [50, 40, 70], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        className="cursor-move"
      >
        <color attach="background" args={['#050b18']} />
        <fog attach="fog" args={['#050b18', 0.005, 300]} />
        
        <ambientLight intensity={1.8} color="#0a224a" />
        <directionalLight position={[50, 120, 40]} intensity={1.5} color="#00d2ff" />
        <hemisphereLight groundColor="#000000" color="#ffffff" intensity={0.5} />

        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.05} 
          minDistance={20}
          maxDistance={300}
        />

        <WaterPlane />
        <SERVIROVCageModule 
          markers={markers}
          activeMarkerId={activeMarkerId}
          onMarkerClick={handleMarkerClick}
        />
        
        {/* Floor */}
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -50.1, 0]}>
          <planeGeometry args={[1200, 1200]} />
          <meshStandardMaterial color="#05122b" roughness={0.85} metalness={0.12} />
        </mesh>
      </Canvas>

      {/* Overlay UI (Status & Legend) */}
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
          <div className={\`mt-1 shrink-0 \${activeMarker.status === 'optimal' ? 'text-emerald-500' : activeMarker.status === 'warning' ? 'text-amber-500' : 'text-red-500'}\`}>
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
\`;

fs.writeFileSync(file, content);
console.log('REPLACEMENT SUCCESSFUL');
