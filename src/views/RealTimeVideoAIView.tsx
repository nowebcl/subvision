import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Video, Sparkles, Sliders, AlertTriangle, EyeOff, Radio, Play, Pause } from 'lucide-react';

export const RealTimeVideoAIView: React.FC = () => {
  const { selectedCenter } = useApp();
  
  // Active Cage Camera State
  const [selectedCageCam, setSelectedCageCam] = useState(selectedCenter.cages[0]);
  const [isSwitching, setIsSwitching] = useState(false);

  // Reset selected cage camera when center changes
  useEffect(() => {
    setSelectedCageCam(selectedCenter.cages[0]);
  }, [selectedCenter]);
  
  // States for toggles
  const [meshTearDetection, setMeshTearDetection] = useState(true);
  const [fishCounting, setFishCounting] = useState(true);
  const [debrisAlerting, setDebrisAlerting] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  
  // Dynamic video source based on odd/even cage id
  const cageNumStr = selectedCageCam.id.replace('h-', '').replace('a-', '').replace('q-', '').replace('h101', '101').replace('h102', '102').replace('h103', '103').replace('h104', '104').replace('h105', '105').replace('h106', '106');
  const cageNum = parseInt(cageNumStr, 10);
  const isEvenCage = isNaN(cageNum) ? false : cageNum % 2 === 0;
  const videoSrc = isEvenCage ? '/VIDEO2.mp4' : '/VIDEO.mp4';
  
  // Simulation metrics
  const [fishCount, setFishCount] = useState(240);
  const [turbidity, setTurbidity] = useState(1.2);
  const [tearConfidence, setTearConfidence] = useState(94.2);

  const handleSwitchCage = (cage: typeof selectedCenter.cages[0]) => {
    setIsSwitching(true);
    setSelectedCageCam(cage);
    setTimeout(() => {
      setIsSwitching(false);
    }, 600); // 600ms transition time
  };

  // Fluctuating simulation numbers
  useEffect(() => {
    if (!cameraActive || isSwitching) return;
    const interval = setInterval(() => {
      setFishCount(prev => Math.max(100, Math.min(400, prev + Math.floor((Math.random() - 0.5) * 15))));
      setTurbidity(prev => Math.max(0.5, Math.min(3.0, Number((prev + (Math.random() - 0.5) * 0.1).toFixed(2)))));
      setTearConfidence(prev => Math.max(90, Math.min(99, Number((prev + (Math.random() - 0.5) * 0.3).toFixed(1)))));
    }, 3000);
    return () => clearInterval(interval);
  }, [cameraActive, isSwitching]);

  return (
    <div className="flex-1 bg-slate-50 min-h-[calc(100vh-73px)] p-6 space-y-6 flex flex-col items-center overflow-y-auto w-full">
      
      {/* Header (Full Width to match the new wide columns layout) */}
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Video className="w-6 h-6 text-cyan-600" />
            Video en Tiempo Real
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Transmisiones directas de cámaras subacuáticas y análisis computerizado de mallas y especies.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Camera Select Dropdown */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider whitespace-nowrap">Cámara:</span>
            <select
              value={selectedCageCam.id}
              onChange={(e) => {
                const cage = selectedCenter.cages.find(c => c.id === e.target.value);
                if (cage) handleSwitchCage(cage);
              }}
              className="bg-transparent border-0 text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-0 cursor-pointer"
            >
              {selectedCenter.cages.map(cage => (
                <option key={cage.id} value={cage.id}>{cage.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setCameraActive(!cameraActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border ${
              cameraActive 
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200' 
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'
            }`}
          >
            {cameraActive ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pausar Conexión</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Iniciar Conexión</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Layout: Side-by-Side Video & Panels */}
      <div className="w-full max-w-[1280px] flex flex-col lg:flex-row gap-6 items-start justify-center">
        
        {/* Left Column: Video Viewport */}
        <div className="flex-1 w-full bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden relative aspect-video shadow-premium flex items-center justify-center">
          {cameraActive ? (
            <>
              {/* Switch camera static glitch effect */}
              {isSwitching && (
                <div className="absolute inset-0 bg-slate-900 z-30 flex flex-col items-center justify-center pointer-events-none">
                  {/* Scanlines */}
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.35),rgba(0,0,0,0.35)_2px,transparent_2px,transparent_4px)] opacity-60 z-10" />
                  {/* Vignette */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0f172a_100%)] z-20" />
                  
                  <div className="flex flex-col items-center gap-3 text-cyan-400 font-mono z-30 animate-pulse">
                    <Radio className="w-8 h-8 text-cyan-500 animate-spin" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">CONECTANDO: CAM-{selectedCageCam.id.replace('h-', '').replace('a-', '').replace('q-', '').replace('h101', '101').replace('h102', '102').replace('h103', '103').replace('h104', '104').replace('h105', '105').replace('h106', '106').toUpperCase()}</span>
                    <span className="text-[8px] text-slate-500">Sincronizando flujo de datos de cámara...</span>
                  </div>
                </div>
              )}

              {/* Overlay Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#000000bd_100%)] pointer-events-none z-10" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

              {/* Scanning Sonar Ring */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
                <div className="w-96 h-96 rounded-full border border-cyan-500/20 relative animate-sonar flex items-center justify-center">
                  <div className="w-72 h-72 rounded-full border border-cyan-500/10" />
                  <div className="absolute inset-0 w-full h-full rounded-full border-r border-t border-cyan-500/40 animate-sweep" />
                </div>
              </div>

              {/* Top OSD Camera Telemetry Overlay */}
              <div className="absolute top-4 left-4 text-white text-[10px] font-mono space-y-1 z-20 bg-slate-950/70 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>TRANSMISIÓN EN VIVO</span>
                </div>
                <div>CÁMARA: CAM-{selectedCageCam.id.replace('h-', '').replace('a-', '').replace('q-', '').replace('h101', '101').replace('h102', '102').replace('h103', '103').replace('h104', '104').replace('h105', '105').replace('h106', '106').toUpperCase()}-01</div>
                <div>CENTRO: {selectedCenter.name.toUpperCase()}</div>
                <div>COORD: {selectedCenter.coordinates}</div>
                <div>MODO: SUB-ACUÁTICO ROV FEED</div>
              </div>

              {/* Top Right Live Sensor Diagnostics */}
              <div className="absolute top-4 right-4 text-white text-[10px] font-mono space-y-1 z-20 bg-slate-950/70 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                <div>TEMPERATURA: <span className="text-cyan-400 font-semibold">{selectedCenter.waterParams.temperature} °C</span></div>
                <div>TURBIEDAD: <span className="text-cyan-400 font-semibold">{turbidity} NTU</span></div>
                <div>PRESIÓN: 2.1 bar</div>
                <div>DENSIDAD PECES: <span className="text-cyan-400 font-semibold">Alta</span></div>
              </div>

              {/* CCTV Visual Elements & Bounding Boxes */}
              
              {/* Fish count markers */}
              {fishCounting && (
                <>
                  <div className="absolute top-[35%] left-[20%] border border-cyan-400/80 bg-cyan-950/20 text-cyan-300 p-1 text-[8px] font-mono rounded flex flex-col pointer-events-none">
                    <span>S. salar (x42)</span>
                    <span className="text-[6px] text-cyan-400">Conf. 98.1%</span>
                  </div>
                  <div className="absolute bottom-[30%] right-[30%] border border-cyan-400/80 bg-cyan-950/20 text-cyan-300 p-1 text-[8px] font-mono rounded flex flex-col pointer-events-none">
                    <span>S. salar (x98)</span>
                    <span className="text-[6px] text-cyan-400">Conf. 97.4%</span>
                  </div>
                </>
              )}

              {/* Net Tear Detection marker (Conditional based on active cage status warnings) */}
              {meshTearDetection && selectedCageCam.status !== 'optimal' && (
                <div className="absolute top-[20%] right-[20%] w-32 h-20 border-2 border-dashed border-red-500 bg-red-950/10 z-20 flex flex-col justify-between p-1.5 animate-pulse">
                  <div className="flex items-center gap-1 bg-red-600 text-white font-mono text-[8px] px-1 py-0.5 rounded leading-none w-max">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>ROTURA DETECTADA</span>
                  </div>
                  <div className="text-[9px] font-mono text-white text-right space-y-0.5">
                    <div>Área: 1.2m vertical</div>
                    <div>Conf: {tearConfidence}%</div>
                  </div>
                </div>
              )}

              {/* Debris Alerting marker */}
              {debrisAlerting && (
                <div className="absolute bottom-[25%] left-[25%] border border-amber-500 bg-amber-950/20 text-amber-300 p-1.5 text-[8px] font-mono rounded flex flex-col pointer-events-none animate-pulse">
                  <span className="bg-amber-600 text-white px-1 py-0.5 rounded font-bold">OBJETO EXTRAÑO</span>
                  <span>Basura / Plástico marino</span>
                  <span className="text-[6px] text-amber-400">Conf. 85.3%</span>
                </div>
              )}

              {/* Native Video Feed from public folder - SHARED FOR EACH INSTALLATION */}
              <video 
                src={videoSrc} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover z-0" 
              />

              {/* Bottom OSD controls */}
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-between text-white text-[10px] font-mono z-20 bg-slate-950/70 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <span>TRANSMISIÓN ACTIVA [CAM_{selectedCageCam.id.replace('h-', '').replace('a-', '').replace('q-', '').replace('h101', '101').replace('h102', '102').replace('h103', '103').replace('h104', '104').replace('h105', '105').replace('h106', '106').toUpperCase()}]</span>
                </div>
                <div>PROFUNDIDAD: -18.4M</div>
                <div>{new Date().toLocaleTimeString()}</div>
              </div>
            </>
          ) : (
            <div className="text-center space-y-3.5 z-20">
              <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-500 w-16 h-16 flex items-center justify-center mx-auto">
                <EyeOff className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-slate-200 font-bold text-sm">Conexión Suspendida</h4>
                <p className="text-slate-500 text-[10px]">Active la conexión de transmisión para comenzar el análisis.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Stacked control cards */}
        <div className="w-full lg:w-[390px] shrink-0 flex flex-col gap-6">
          
          {/* Panel 1: Consola de Capas AI */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium space-y-4">
            <div className="border-b border-slate-50 pb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-600" />
                Consola de Capas AI
              </h3>
              <p className="text-slate-400 text-[10px] leading-relaxed mt-0.5">
                Active las capas de detección visual sobre la transmisión en tiempo real.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              {/* Toggle Net Tears */}
              <button
                onClick={() => cameraActive && setMeshTearDetection(!meshTearDetection)}
                disabled={!cameraActive}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  meshTearDetection && cameraActive
                    ? 'border-cyan-500 bg-cyan-50/10 shadow-sm'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-800">Roturas en Mallas</span>
                  <span className={`w-2 h-2 rounded-full ${meshTearDetection && cameraActive ? 'bg-cyan-500' : 'bg-slate-300'}`} />
                </div>
                <p className="text-[9px] text-slate-400 leading-snug">Detección de aberturas y rasgaduras de red.</p>
              </button>

              {/* Toggle Fish Counting */}
              <button
                onClick={() => cameraActive && setFishCounting(!fishCounting)}
                disabled={!cameraActive}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  fishCounting && cameraActive
                    ? 'border-cyan-500 bg-cyan-50/10 shadow-sm'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-800">Conteo de Peces</span>
                  <span className={`w-2 h-2 rounded-full ${fishCounting && cameraActive ? 'bg-cyan-500' : 'bg-slate-300'}`} />
                </div>
                <p className="text-[9px] text-slate-400 leading-snug">Conteo y segmentación de biomasa por IA.</p>
              </button>

              {/* Toggle Debris */}
              <button
                onClick={() => cameraActive && setDebrisAlerting(!debrisAlerting)}
                disabled={!cameraActive}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  debrisAlerting && cameraActive
                    ? 'border-cyan-500 bg-cyan-50/10 shadow-sm'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-800">Escombros y Objetos</span>
                  <span className={`w-2 h-2 rounded-full ${debrisAlerting && cameraActive ? 'bg-cyan-500' : 'bg-slate-300'}`} />
                </div>
                <p className="text-[9px] text-slate-400 leading-snug">Identificación de plásticos u objetos extraños.</p>
              </button>
            </div>
          </div>

          {/* Panel 2: Telemetría AI Activa */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-50 pb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-600" />
                  Telemetría Diagnóstico AI
                </h3>
                <p className="text-slate-400 text-[10px] leading-relaxed mt-0.5">
                  Métricas calculadas por el modelo de visión artificial del centro.
                </p>
              </div>

              {cameraActive ? (
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400 text-[8px] font-bold uppercase block">Peces Detectados</span>
                    <span className="text-xs font-bold text-slate-700">{fishCount} unidades</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400 text-[8px] font-bold uppercase block">Confianza Rotura</span>
                    <span className="text-xs font-bold text-red-600">{tearConfidence}%</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400 text-[8px] font-bold uppercase block">Salud Malla</span>
                    <span className={`text-xs font-bold ${selectedCageCam.status === 'optimal' ? 'text-emerald-600' : selectedCageCam.status === 'warning' ? 'text-amber-500' : 'text-red-600'}`}>
                      {selectedCageCam.status === 'optimal' ? 'Óptima' : selectedCageCam.status === 'warning' ? 'Advertencia' : 'Alerta Crítica'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                    <span className="text-slate-400 text-[8px] font-bold uppercase block">Turbiedad del Agua</span>
                    <span className="text-xs font-bold text-slate-700">{turbidity} NTU</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-[10px] font-mono">
                  Encienda la conexión para recibir telemetría.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
