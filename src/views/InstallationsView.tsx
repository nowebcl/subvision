import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Anchor, ShieldAlert, CheckCircle2, Info, Eye } from 'lucide-react';
import { type CageData } from '../data/mockData';

export const InstallationsView: React.FC = () => {
  const { selectedCenter, rovReports } = useApp();
  const [selectedCage, setSelectedCage] = useState<CageData | null>(selectedCenter.cages[0]);

  const detectCageId = (reportText: string) => {
    const text = reportText.toLowerCase();
    if (text.includes('101')) return '101';
    if (text.includes('102')) return '102';
    if (text.includes('103')) return '103';
    if (text.includes('104')) return '104';
    if (text.includes('105')) return '105';
    if (text.includes('106')) return '106';
    if (text.includes('107')) return '107';
    if (text.includes('108') || text.includes('b2')) return '108';
    if (text.includes('109')) return '109';
    if (text.includes('110')) return '110';
    if (text.includes('111')) return '111';
    if (text.includes('112')) return '112';
    if (text.includes('113')) return '113';
    if (text.includes('114')) return '114';
    return null;
  };

  // Mooring grid renderer: SVG mapping lines
  const centerOfMass = { x: 150, y: 150 };
  const getLineCoordinates = (angle: number, length: number) => {
    const angleRad = (angle * Math.PI) / 180;
    return {
      x2: centerOfMass.x + length * Math.cos(angleRad),
      y2: centerOfMass.y + length * Math.sin(angleRad)
    };
  };

  return (
    <div className="flex-1 p-6 space-y-6 bg-slate-50 overflow-y-auto animate-fade-in">
      
      {/* View Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Estructuras e Instalaciones</h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Monitoreo estructural de mallas de protección y líneas de fondeo en <span className="font-semibold">{selectedCenter.name}</span>.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Columns: Cages and Mooring lines */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Cages Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-50 pb-3">
              Malla Flotante de Producción ({selectedCenter.cages.length} Jaulas)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {selectedCenter.cages.map(cage => {
                const cageNum = cage.id.replace('h-', '').replace('a-', '').replace('q-', '').replace('h101', '101').replace('h102', '102').replace('h103', '103').replace('h104', '104').replace('h105', '105').replace('h106', '106');
                const matchingReport = rovReports.find(
                  r => r.centroId === selectedCenter.id && detectCageId(r.nombre + ' ' + r.redes) === cageNum
                );

                return (
                  <button
                    key={cage.id}
                    onClick={() => setSelectedCage(cage)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      selectedCage?.id === cage.id 
                        ? 'border-cyan-500 bg-cyan-50/10 shadow-md ring-1 ring-cyan-500/20' 
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 text-sm">{cage.name}</span>
                        <a
                          href={matchingReport ? `/visor.html?center=${selectedCenter.id}&report=${matchingReport.id}` : `/visor.html?center=${selectedCenter.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md text-slate-400 hover:text-cyan-600 hover:bg-cyan-50/50 transition-all flex items-center justify-center"
                          title="Ver en Visor 3D"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                        cage.status === 'optimal' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : cage.status === 'warning' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {cage.status}
                      </span>
                    </div>
                  
                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Integridad:</span>
                      <span className={`font-bold ${
                        cage.netIntegrity < 80 ? 'text-red-500' : cage.netIntegrity < 90 ? 'text-amber-500' : 'text-slate-700'
                      }`}>{cage.netIntegrity}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          cage.netIntegrity < 80 ? 'bg-red-500' : cage.netIntegrity < 90 ? 'bg-amber-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${cage.netIntegrity}%` }}
                      />
                    </div>
                    <div className="flex justify-between pt-1">
                      <span>Tensión Fondeo:</span>
                      <span className="font-semibold text-slate-700">{cage.mooringTensionKn.toFixed(1)} kN</span>
                    </div>
                  </div>
                </button>
              );
            })}
            </div>
          </div>

          {/* Mooring Lines Visual Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-50 pb-3">
                Distribución Mecánica de Anclajes
              </h3>
              <p className="text-slate-500 text-xs mb-4">
                El vector de anclaje muestra la tensión en kN. Los fondeos en rojo superan la fuerza límite recomendada.
              </p>

              <div className="space-y-3.5">
                {selectedCenter.mooringLines.map(line => (
                  <div key={line.id} className="bg-slate-50 p-3 rounded-xl flex items-center justify-between border border-slate-100/50">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${
                        line.status === 'optimal' ? 'bg-emerald-50 text-emerald-600' : line.status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                      }`}>
                        <Anchor className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{line.code}</span>
                        <span className="text-[10px] text-slate-400">Ángulo: {line.angle}° • Límite: {line.limitKn} kN</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold block ${
                        line.status === 'optimal' ? 'text-slate-800' : line.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                      }`}>{line.tensionKn.toFixed(1)} kN</span>
                      <span className="text-[9px] text-slate-400">Tensión</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SVG Mooring Schematic Radar */}
            <div className="flex items-center justify-center bg-slate-950 rounded-2xl p-4 relative min-h-[250px] overflow-hidden border border-slate-900 shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#000000bd_100%)] pointer-events-none" />
              
              <svg className="w-64 h-64 z-10" viewBox="0 0 300 300">
                {/* Concentric rings */}
                <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="150" cy="150" r="90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <circle cx="150" cy="150" r="60" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="150" cy="150" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* Central Cage Platform */}
                <rect x="125" y="125" width="50" height="50" rx="6" fill="#1e293b" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1.5" />
                <text x="150" y="153" fill="rgba(6, 182, 212, 0.8)" fontSize="8" fontFamily="monospace" textAnchor="middle">CENTRO</text>

                {/* Mooring line vectors */}
                {selectedCenter.mooringLines.map(line => {
                  const length = (line.tensionKn / line.limitKn) * 110;
                  const target = getLineCoordinates(line.angle, length);
                  
                  let strokeColor = '#10b981'; // optimal green
                  if (line.status === 'critical') strokeColor = '#ef4444'; // critical red
                  else if (line.status === 'warning') strokeColor = '#f59e0b'; // warning amber
                  
                  return (
                    <g key={line.id}>
                      {/* Mooring Line Path */}
                      <line
                        x1={centerOfMass.x}
                        y1={centerOfMass.y}
                        x2={target.x2}
                        y2={target.y2}
                        stroke={strokeColor}
                        strokeWidth="2.5"
                        strokeDasharray={line.status === 'critical' ? 'none' : 'none'}
                        className="transition-all"
                      />
                      {/* Anchor Node */}
                      <circle
                        cx={target.x2}
                        cy={target.y2}
                        r="5"
                        fill={strokeColor}
                        className="animate-pulse"
                      />
                      {/* Label */}
                      <text
                        x={target.x2 + (line.angle > 90 && line.angle < 270 ? -12 : 12)}
                        y={target.y2 + 4}
                        fill="rgba(255,255,255,0.7)"
                        fontSize="7"
                        fontFamily="monospace"
                        textAnchor={line.angle > 90 && line.angle < 270 ? 'end' : 'start'}
                      >
                        {line.code.split(' ').pop()} ({line.tensionKn.toFixed(0)}k)
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

        </div>

        {/* Right Column: Cage Detail Sidebar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-premium flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-50 pb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-600" />
              Detalle Técnico Jaula
            </h3>

            {selectedCage ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-800">{selectedCage.name}</h4>
                  <span className="text-slate-400 text-xs font-mono">Stock de Producción</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400 text-[10px] font-semibold block uppercase">Especie</span>
                    <span className="text-sm font-bold text-slate-700">{selectedCage.species}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400 text-[10px] font-semibold block uppercase">N° Peces</span>
                    <span className="text-sm font-bold text-slate-700">{selectedCage.count.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400 text-[10px] font-semibold block uppercase">Peso Promedio</span>
                    <span className="text-sm font-bold text-slate-700">{selectedCage.avgWeightKg} kg</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400 text-[10px] font-semibold block uppercase">Biomasa Total</span>
                    <span className="text-sm font-bold text-slate-700">{selectedCage.biomassTons} t</span>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Última Limpieza de Malla</span>
                    <span className="text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded-lg">{selectedCage.lastCleaned}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Tensión Sensor L-Fondeo</span>
                    <span className="text-slate-700 font-bold">{selectedCage.mooringTensionKn.toFixed(1)} kN</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-slate-50/50 space-y-2">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">Evaluación de Riesgo</div>
                  {selectedCage.status === 'optimal' ? (
                    <div className="text-xs text-emerald-700 bg-emerald-100/50 p-2.5 rounded-lg flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Estructura intacta. Malla limpia de biofouling y anclajes en rango óptimo de tracción. No requiere mantención inmediata.</span>
                    </div>
                  ) : selectedCage.status === 'warning' ? (
                    <div className="text-xs text-amber-700 bg-amber-100/50 p-2.5 rounded-lg flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Integridad en 82.5%. Acumulación moderada de algas detectada por sensores de flujo. Se aconseja programar limpieza en 72 horas.</span>
                    </div>
                  ) : (
                    <div className="text-xs text-red-700 bg-red-100/50 p-2.5 rounded-lg flex items-start gap-2 border border-red-200/50">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>ALERTA CRÍTICA: Integridad del 74.2% con indicios de rotura en el paño inferior. Tensión crítica de fondeo en 94.5 kN. Desplegar ROV de inspección de manera prioritaria.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs font-mono">
                Seleccione una jaula para cargar telemetría detallada.
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 text-center font-mono border-t border-slate-50 pt-4">
            Servirov Telemetry ID: SV-GRID-C1
          </div>
        </div>

      </div>

    </div>
  );
};
