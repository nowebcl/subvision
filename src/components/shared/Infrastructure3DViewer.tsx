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
    position: [0.0, -8.0, 39.0], // Fijo en la línea frontal inferior de la malla de Jaula 101
    title: 'Línea Frontal Inferior Red Lobera (Jaula 101)',
    depth: '-8.0m',
    status: 'optimal',
    description: 'Tensión y costura perimetral en estado óptimo sobre la arista frontal sur.',
    component: 'Red Lobera Perimetral'
  },
  {
    id: 2,
    position: [-11.0, -4.0, 0.0], // Fijo en la arista vertical izquierda (Oeste) de Jaula 102
    title: 'Arista Vertical Oeste Red Lobera (Jaula 102)',
    depth: '-4.0m',
    status: 'warning',
    description: 'Adherencia moderada de biofouling y leve tensión lateral en el vértice exterior oeste.',
    component: 'Red Lobera Vertical'
  },
  {
    id: 3,
    position: [11.0, -4.0, 0.0], // Fijo en la arista vertical derecha (Este) de Jaula 102
    title: 'Arista Vertical Este Red Lobera (Jaula 102)',
    depth: '-4.0m',
    status: 'optimal',
    description: 'Alineación estructural perfecta de la línea vertical exterior y paño lateral este.',
    component: 'Red Lobera Vertical'
  },
  {
    id: 4,
    position: [0.0, -2.0, -39.0], // Fijo en la línea posterior superior de Jaula 103
    title: 'Línea Posterior Red Lobera (Jaula 103)',
    depth: '-2.0m',
    status: 'critical',
    description: 'Desgaste mecánico e indicios de roce en el paño exterior norte por fricción continua.',
    component: 'Red Lobera Superior'
  },
  {
    id: 5,
    position: [0.0, -2.0, -14.0], // Fijo en la línea divisoria central entre Jaula 102 y 103
    title: 'Línea Divisoria Central (Unión 102-103)',
    depth: '-2.0m',
    status: 'optimal',
    description: 'Tensión nominal correcta en los tensores divisorios intermedios entre módulos 102 y 103.',
    component: 'Unión Intermodular'
  }
];

// Helper para generar textura de etiquetas 101, 102, 103 idénticas al visor oficial
function createCageLabelTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, 256, 128);

    // Fondo azul marino oscuro rectangular con borde
    ctx.fillStyle = '#06173a';
    ctx.fillRect(16, 16, 224, 96);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, 224, 96);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 64);
  }

  return new THREE.CanvasTexture(canvas);
}

// Sub-componente que renderiza la batería rectangular de 3 jaulas (103, 102, 101) tal cual la captura oficial
const RectangularBatteryMesh: React.FC<{
  activeMarkerId: number | null;
  onSelectMarker: (marker: FindingMarker) => void;
  markers: FindingMarker[];
}> = ({ activeMarkerId, onSelectMarker, markers }) => {
  const labelTextures = useMemo(() => {
    return {
      '103': createCageLabelTexture('103'),
      '102': createCageLabelTexture('102'),
      '101': createCageLabelTexture('101')
    };
  }, []);

  // Geometría wireframe precalculada para cada módulo rectangular de malla (BoxGeometry 22 x 16 x 22)
  const netEdgesGeometry = useMemo(() => {
    const boxGeo = new THREE.BoxGeometry(22, 16, 22);
    return new THREE.EdgesGeometry(boxGeo);
  }, []);

  const cagesData = [
    { id: '103', z: -28 },
    { id: '102', z: 0 },
    { id: '101', z: 28 }
  ];

  // Coordenadas oficiales de las líneas de fondeo desde los vértices del módulo hasta el fondo
  const mooringLines = useMemo(() => [
    { start: new THREE.Vector3(-12, 8, -42), end: new THREE.Vector3(-60, -25, -90) },
    { start: new THREE.Vector3(12, 8, -42), end: new THREE.Vector3(60, -25, -90) },
    { start: new THREE.Vector3(-12, 8, 42), end: new THREE.Vector3(-60, -25, 90) },
    { start: new THREE.Vector3(12, 8, 42), end: new THREE.Vector3(60, -25, 90) },
    { start: new THREE.Vector3(-12, 8, -14), end: new THREE.Vector3(-70, -25, -30) },
    { start: new THREE.Vector3(12, 8, -14), end: new THREE.Vector3(70, -25, -30) },
    { start: new THREE.Vector3(-12, 8, 14), end: new THREE.Vector3(-70, -25, 30) },
    { start: new THREE.Vector3(12, 8, 14), end: new THREE.Vector3(70, -25, 30) }
  ], []);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. ESTRUCTURA DE PASARELAS Y VIGAS SUPERIORES DE LA BATERÍA (Negro Industrial #111827) */}
      {/* Vigas longitudinales largas Oeste y Este */}
      {[-12, 12].map((x, idx) => (
        <mesh key={`long-beam-${idx}`} position={[x, 8, 0]}>
          <boxGeometry args={[1.2, 1.2, 84]} />
          <meshStandardMaterial color="#111827" roughness={0.6} />
        </mesh>
      ))}

      {/* Vigas transversales de división de cuadrantes */}
      {[-42, -14, 14, 42].map((z, idx) => (
        <mesh key={`cross-beam-${idx}`} position={[0, 8, z]}>
          <boxGeometry args={[24, 1.2, 1.2]} />
          <meshStandardMaterial color="#111827" roughness={0.6} />
        </mesh>
      ))}

      {/* 2. JAULAS RECTANGULARES 103, 102, 101 (Malla Roja Wireframe + Interior Semitransparente + Placa) */}
      {cagesData.map((cage) => (
        <group key={`cage-module-${cage.id}`} position={[0, 0, cage.z]}>
          {/* Collar/plataforma perimetral del módulo */}
          <mesh position={[0, 8, 0]}>
            <boxGeometry args={[24, 0.8, 24]} />
            <meshStandardMaterial color="#1f2937" roughness={0.5} />
          </mesh>

          {/* Líneas rojas sólidas de la malla wireframe (#ef4444) */}
          <lineSegments geometry={netEdgesGeometry} position={[0, 0, 0]}>
            <lineBasicMaterial color="#ef4444" linewidth={2} transparent={true} opacity={0.9} />
          </lineSegments>

          {/* Paredes rojas semitransparentes del interior de la red */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[22, 16, 22]} />
            <meshBasicMaterial
              color="#ef4444"
              transparent={true}
              opacity={0.08}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Placa rectangular azul oscura con texto "101", "102", "103" sobre la superficie del agua */}
          <mesh position={[0, 8.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[12, 6]} />
            <meshBasicMaterial
              map={labelTextures[cage.id as keyof typeof labelTextures]}
              transparent={true}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* 3. LÍNEAS DE FONDEO Y ANCLAJES AL FONDO MARINO */}
      {mooringLines.map((line, idx) => {
        const points = [line.start, line.end];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <group key={`mooring-line-${idx}`}>
            {/* Línea de tensión hacia el fondo */}
            <primitive
              object={new THREE.Line(
                geometry,
                new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.65, linewidth: 1.5 })
              )}
            />
            {/* Bloque de anclaje de fondo */}
            <mesh position={line.end}>
              <boxGeometry args={[2.5, 2.5, 2.5]} />
              <meshStandardMaterial color="#334155" roughness={0.9} />
            </mesh>
          </group>
        );
      })}

      {/* 4. PLANO DE FONDO MARINO DE REFERENCIA */}
      <mesh position={[0, -25.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#05122b" roughness={0.85} metalness={0.12} />
      </mesh>

      {/* 5. MARCADORES DE HALLAZGOS FIJOS DIRECTAMENTE SOBRE LAS LÍNEAS DE LA MALLA (Sin Flotar) */}
      {markers.map((marker) => {
        const isActive = activeMarkerId === marker.id;
        const statusBorderColor =
          marker.status === 'optimal'
            ? 'rgba(52, 211, 153, 0.95)'
            : marker.status === 'warning'
            ? 'rgba(251, 191, 36, 0.95)'
            : 'rgba(248, 113, 113, 0.95)';
        const statusBgColor =
          marker.status === 'optimal'
            ? 'rgba(6, 78, 59, 0.75)'
            : marker.status === 'warning'
            ? 'rgba(120, 53, 15, 0.75)'
            : 'rgba(127, 29, 29, 0.75)';
        const statusTextColor =
          marker.status === 'optimal'
            ? '#34d399'
            : marker.status === 'warning'
            ? '#fbbf24'
            : '#f87171';

        return (
          <group key={marker.id} position={marker.position}>
            {/* Nodo físico 3D anclado firmemente en la arista de la línea para evitar flotación */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.55, 16, 16]} />
              <meshBasicMaterial color={marker.status === 'optimal' ? '#10b981' : marker.status === 'warning' ? '#f59e0b' : '#ef4444'} />
            </mesh>

            {/* Etiqueta HTML proyectada con Drei exactamente sobre el nodo físico */}
            <Html center zIndexRange={[100, 0]}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMarker(marker);
                }}
                style={{
                  width: '38px',
                  height: '38px',
                  border: `2px solid ${statusBorderColor}`,
                  borderRadius: '50%',
                  background: statusBgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: statusTextColor,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 900,
                  fontSize: '15px',
                  boxShadow: isActive
                    ? `0 0 20px ${statusBorderColor}, inset 0 0 12px rgba(255,255,255,0.4)`
                    : `0 0 12px ${statusBorderColor}, inset 0 0 8px rgba(0,0,0,0.5)`,
                  cursor: 'pointer',
                  transform: isActive ? 'scale(1.25)' : 'scale(1)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
                title={`${marker.title} (${marker.depth})`}
                className="hover:scale-125 hover:border-white hover:text-white"
              >
                <span>{marker.id}</span>

                {/* Anillo de radar punteado giratorio */}
                <span
                  style={{
                    position: 'absolute',
                    inset: '-5px',
                    border: `1px dashed ${statusBorderColor}`,
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    animation: 'spin 12s linear infinite'
                  }}
                />
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

export const Infrastructure3DViewer: React.FC<{
  cageName?: string;
}> = ({ cageName = 'Batería Módulos 101-103' }) => {
  const [activeMarker, setActiveMarker] = useState<FindingMarker | null>(defaultMarkers[1]); // Selecciona hallazgo #2 por defecto

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-premium overflow-hidden flex flex-col">
      {/* Header superior del Visor */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 font-bold text-[10px] uppercase tracking-wider border border-cyan-500/30 font-mono">
              R3F 3D Live Engine
            </span>
            <h3 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
              Visor Tridimensional de Instalaciones • <span className="text-cyan-400 font-mono">{cageName}</span>
            </h3>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            Estructura fidedigna de batería 3 módulos (103, 102, 101) con hallazgos anclados firmemente a las aristas de la malla.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-3 text-xs bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 shadow-sm">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Óptimo
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Advertencia
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse" /> Crítico
            </span>
          </div>
        </div>
      </div>

      {/* Contenedor Principal: Canvas 3D + Panel Interactivo Lateral HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 relative bg-[#050b18] min-h-[480px]">
        
        {/* R3F Canvas Area con Fondo Azul Marino Oceánico (#050b18) */}
        <div className="lg:col-span-2 h-[480px] relative select-none">
          {/* Instrucciones flotantes en esquina */}
          <div className="absolute top-3 left-3 z-10 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 shadow-sm text-[11px] text-slate-300 font-mono flex items-center gap-2 pointer-events-none">
            <span>🖱️ Arrastrar rotar • Scroll zoom • Clic marcador</span>
          </div>

          {/* R3F Canvas configurado idéntico al visor oficial */}
          <Canvas
            camera={{ position: [70, 75, 110], fov: 45 }}
            style={{ background: '#050b18' }}
          >
            <ambientLight intensity={1.8} color="#0a224a" />
            <directionalLight position={[50, 120, 40]} intensity={1.5} color="#00d2ff" castShadow />
            <pointLight position={[0, 15, 0]} intensity={1.0} color="#ffffff" distance={150} />

            <RectangularBatteryMesh
              activeMarkerId={activeMarker ? activeMarker.id : null}
              onSelectMarker={(m) => setActiveMarker(m)}
              markers={defaultMarkers}
            />

            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={20}
              maxDistance={350}
              maxPolarAngle={Math.PI / 2 - 0.05}
              dampingFactor={0.05}
              makeDefault
            />
          </Canvas>
        </div>

        {/* Panel Interactivo de Hallazgo Seleccionado (1 Columna lateral) */}
        <div className="lg:col-span-1 bg-slate-900 text-slate-200 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 flex flex-col justify-between overflow-y-auto max-h-[480px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Auditoría del Punto
                </h4>
              </div>
              {activeMarker && (
                <span className="font-mono text-xs font-black text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                  HALLAZGO #{activeMarker.id}
                </span>
              )}
            </div>

            {activeMarker ? (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-cyan-400 block">
                    {activeMarker.component}
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-0.5 leading-snug">
                    {activeMarker.title}
                  </h3>
                </div>

                {/* Coordenadas tridimensionales exactas sobre arista */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block">Arista Fija [X, Y, Z]</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      [{activeMarker.position.map(n => n.toFixed(0)).join(', ')}]
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block">Profundidad</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {activeMarker.depth}
                    </span>
                  </div>
                </div>

                {/* Estado Técnico del Hallazgo */}
                <div className={`p-3.5 rounded-xl border ${
                  activeMarker.status === 'optimal'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : activeMarker.status === 'warning'
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      {activeMarker.status === 'optimal' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : activeMarker.status === 'warning' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      )}
                      Diagnóstico: {activeMarker.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-95 font-medium text-slate-300">
                    {activeMarker.description}
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="font-bold text-slate-300 text-xs">Especificación Mecánica:</div>
                  <div>• Punto anclado directamente a la línea wireframe para cero fluctuación.</div>
                  <div>• Sincronización en tiempo real con auditoría marina de SERVIROV.</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                Haz clic en cualquier número sobre la malla para inspeccionar.
              </div>
            )}
          </div>

          {/* Footer del panel */}
          <div className="pt-4 border-t border-slate-800 mt-4">
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Aristas monitoreadas: {defaultMarkers.length}</span>
              <span className="text-cyan-400 font-semibold">● R3F Fixed Coordinates</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
