import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Server, 
  ArrowRight, 
  Loader2, 
  CheckCheck, 
  Send, 
  Check, 
  Activity, 
  ShieldAlert, 
  Layers, 
  Cpu 
} from 'lucide-react';
import { queryGroq } from '../lib/groq';

const GROQ_SYSTEM_INSTRUCTION = `Eres el módulo de monitoreo en tiempo real de la app SUBVISION de la empresa SERVIROV. Tu función es procesar los reportes de errores en las redes de pesca y estructurar alertas técnicas críticas de manera inmediata.

Cuando se reporte una anomalía o falla, debes generar un mensaje con la siguiente estructura exacta (omitiendo saludos, introducciones o lenguaje comercial):

🚨 ALERTAS SUBVISION - SERVIROV 🚨
⚠️ ESTADO: [Tipo de Error / Anomalía detectada]
📍 UBICACIÓN/MÓDULO: [Indicar módulo o coordenada afectada]
⏱️ HORA REGISTRO: [Hora del evento]
⚙️ ACCIÓN REQUERIDA: REVISIÓN URGENTE EN TERRENO.

Reglas operativas:
1. Sé extremadamente directo y conciso. Al ser un canal técnico industrial, no saludes ni te despidas.
2. Si los datos ingresados vienen incompletos, levanta la alerta de igual forma con la información que esté disponible.
3. Usa estrictamente la estructura de los emojis (🚨, ⚠️, 📍, ⏱️, ⚙️) para asegurar una lectura rápida en alta mar o terreno.`;

interface SimulatedAlertMessage {
  id: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export const WhatsAppSimulationView: React.FC = () => {
  const { selectedCenter } = useApp();
  
  // Simulation states
  const [selectedAnomaly, setSelectedAnomaly] = useState<string>('malla-105');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [showFlowPulse, setShowFlowPulse] = useState<boolean>(false);
  const groqModel = 'llama-3.1-8b-instant';
  
  // Chat History on the smartphone
  const [phoneMessages, setPhoneMessages] = useState<SimulatedAlertMessage[]>([]);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  
  const phoneEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phoneEndRef.current) {
      phoneEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [phoneMessages, apiLoading]);

  // Pre-configured anomalies data based on selectedCenter
  const anomaliesList = [
    {
      id: 'malla-105',
      title: 'Rotura Crítica en Malla Pecera (Jaula 105)',
      description: `Se detectó un desgarro lineal de aproximadamente 1.5 metros de longitud en el paño número 4 de la Jaula 105, cuadrante oeste. Profundidad aproximada -12m. Sensor de integridad marca 74.2%.`,
      severity: 'critical'
    },
    {
      id: 'fondeo-b2',
      title: 'Sobretensión Extrema en Línea de Fondeo B2',
      description: `El sensor de celda de carga en la línea de fondeo B2 ha superado el umbral seguro. Lectura actual: 148.9 kN (Límite admisible: 120.0 kN). Ángulo de tensión desplazado.`,
      severity: 'critical'
    },
    {
      id: 'oxigeno-bajo',
      title: 'Descenso Crítico de Oxígeno Disuelto',
      description: `El sensor oceanográfico en el perímetro central del centro registra una caída rápida en la concentración de oxígeno. Valor actual: 4.8 mg/L (Umbral óptimo: >6.5 mg/L).`,
      severity: 'warning'
    },
    {
      id: 'custom',
      title: 'Reporte Manual / Evento Personalizado',
      description: customDescription,
      severity: 'custom'
    }
  ];

  const activeAnomaly = anomaliesList.find(a => a.id === selectedAnomaly) || anomaliesList[0];

  const queryGroqForAlert = async (text: string): Promise<string> => {
    try {
      const userPrompt = `Incidente detectado: ${text}\nUbicación actual del centro: ${selectedCenter.name}, coordenadas: ${selectedCenter.coordinates}`;
      return await queryGroq(GROQ_SYSTEM_INSTRUCTION, userPrompt, groqModel);
    } catch (error: any) {
      console.error(error);
      return `🚨 ALERTAS SUBVISION - SERVIROV 🚨\n⚠️ ESTADO: Error en motor de IA (Groq)\n📍 UBICACIÓN/MÓDULO: API Subvision\n⏱️ HORA REGISTRO: ${new Date().toLocaleTimeString().substring(0, 5)}\n⚙️ ACCIÓN REQUERIDA: ${error.message || error}`;
    }
  };

  const handleTriggerAlert = async () => {
    const reportText = selectedAnomaly === 'custom' ? customDescription : activeAnomaly.description;
    if (!reportText.trim()) return;

    setIsTransmitting(true);
    setShowFlowPulse(true);

    // Turn off flow animation after a while
    setTimeout(() => {
      setShowFlowPulse(false);
    }, 1800);

    // Wait slightly to simulate server trigger latency
    await new Promise(resolve => setTimeout(resolve, 800));
    setApiLoading(true);

    // Call Groq to structure the alert
    const structuredMessage = await queryGroqForAlert(reportText);

    // Add to simulated phone logs
    const newMsg: SimulatedAlertMessage = {
      id: `sim-${Date.now()}`,
      message: structuredMessage,
      timestamp: new Date().toLocaleTimeString().substring(0, 5),
      status: 'sent'
    };

    setPhoneMessages(prev => [...prev, newMsg]);
    setApiLoading(false);
    setIsTransmitting(false);

    // Simulate WhatsApp delivery status updates
    setTimeout(() => {
      setPhoneMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m));
    }, 1000);

    setTimeout(() => {
      setPhoneMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m));
    }, 2000);
  };

  const clearPhoneLogs = () => {
    setPhoneMessages([]);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-[calc(100vh-73px)] animate-fade-in text-xs p-6 space-y-6">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-cyan-600 animate-pulse" />
          Simulador de Automatización WhatsApp Live
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Visualice el flujo de notificaciones en tiempo real: desde la detección de anomalías en la consola de SUBVISION (App) hasta la recepción de alertas estructuradas del sistema Subvision en el dispositivo móvil (Cliente).
        </p>
      </div>

      {/* Dual Panel Layout */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch gap-6 justify-center">
        
        {/* Left Panel: Console App / System */}
        <div className="flex-1 bg-white border border-slate-100 rounded-3xl p-6 shadow-premium flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          
          <div className="space-y-5 relative z-10">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-slate-900 text-slate-100 rounded-lg p-1.5 flex items-center justify-center shadow-sm">
                  <Server className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] leading-tight">Consola de Control SUBVISION</h3>
                  <p className="text-slate-400 text-[9px]">Módulo de Detección de Anomalías e Incidencias (Servirov OS)</p>
                </div>
              </div>
              
              <span className="px-2 py-0.5 rounded-full text-[8px] font-mono font-bold bg-slate-900 text-cyan-400 border border-slate-800 tracking-wider">
                CORE STATUS: MONITORING
              </span>
            </div>

            {/* Simulated System Alert Banner */}
            <div className={`p-4 rounded-2xl border transition-all duration-300 ${
              activeAnomaly.severity === 'critical' 
                ? 'bg-rose-50/50 border-rose-100 text-rose-800' 
                : activeAnomaly.severity === 'warning' 
                ? 'bg-amber-50/50 border-amber-100 text-amber-800'
                : 'bg-cyan-50/30 border-cyan-100 text-cyan-800'
            }`}>
              <div className="flex gap-3">
                <div className={`rounded-xl p-2 h-10 w-10 flex items-center justify-center shrink-0 shadow-sm ${
                  activeAnomaly.severity === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  <ShieldAlert className="w-5.5 h-5.5 animate-bounce" />
                </div>
                <div className="text-left space-y-1">
                  <span className="text-[8px] font-bold uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded-full">
                    {activeAnomaly.severity === 'critical' ? 'Alerta Crítica' : 'Advertencia del Sensor'}
                  </span>
                  <h4 className="font-bold text-slate-800 text-xs">{activeAnomaly.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-mono mt-1">
                    {selectedAnomaly === 'custom' ? (customDescription || 'Escriba un reporte manual en el campo inferior para gatillar la simulación...') : activeAnomaly.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Anomaly selector */}
            <div className="space-y-3.5 text-left pt-2">
              <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[9px] flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Seleccionar Incidente para Simular
              </h5>
              
              <div className="grid grid-cols-1 gap-2.5">
                {anomaliesList.map(a => (
                  <label 
                    key={a.id} 
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                      selectedAnomaly === a.id 
                        ? 'border-cyan-500 bg-cyan-50/10 shadow-sm ring-1 ring-cyan-500/30' 
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/40'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="anomaly" 
                      value={a.id}
                      checked={selectedAnomaly === a.id}
                      onChange={() => setSelectedAnomaly(a.id)}
                      className="mt-0.5 text-cyan-600 focus:ring-cyan-500 border-slate-300"
                    />
                    <div className="text-left">
                      <span className="font-bold text-slate-700 text-[10px] block leading-none">{a.title}</span>
                      <span className="text-[9px] text-slate-400 mt-1 block max-h-5 overflow-hidden text-ellipsis whitespace-nowrap w-64">
                        {a.id === 'custom' ? (customDescription || 'Describa su propio incidente...') : a.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Custom anomaly textarea */}
              {selectedAnomaly === 'custom' && (
                <div className="space-y-1.5 animate-slide-down">
                  <label className="text-slate-500 font-semibold block uppercase text-[8px]">Descripción del incidente personalizado</label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Ej. 'Grave deformación estructural detectada en jaula 102 sector sur a las 22:00...'"
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white text-xs font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Trigger Button and Model Selector */}
          <div className="pt-4 border-t border-slate-50 relative z-10 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            

            <button
              onClick={handleTriggerAlert}
              disabled={isTransmitting || (selectedAnomaly === 'custom' && !customDescription.trim())}
              className="flex-1 py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer disabled:bg-slate-400 disabled:shadow-none"
            >
              {isTransmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Procesando y Transmitiendo Alerta...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-cyan-400" />
                  <span>Enviar Alerta WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Center Section: Flow Arrow Indicator */}
        <div className="flex lg:flex-col items-center justify-center shrink-0 gap-2 select-none py-2 lg:py-0">
          <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-slate-200/50">
            <Cpu className="w-3.5 h-3.5 text-cyan-600 animate-spin" />
            <span>Subvision AI Router</span>
          </div>
          
          <div className="h-0.5 w-12 lg:w-0.5 lg:h-24 bg-slate-200 relative flex items-center justify-center">
            {showFlowPulse && (
              <span className="absolute block rounded-full bg-cyan-500 shadow-lg shadow-cyan-400/50 animate-ping h-4 w-4 lg:animate-pulse" />
            )}
            <ArrowRight className="w-4 h-4 text-cyan-600 rotate-0 lg:rotate-90 animate-bounce" />
          </div>
        </div>

        {/* Right Panel: Operator Device / WhatsApp Simulator */}
        <div className="w-80 bg-slate-100 border border-slate-200 rounded-3xl p-4 flex flex-col justify-between shrink-0 shadow-inner max-h-[600px] mx-auto">
          
          {/* The Smartphone Frame */}
          <div className="flex-1 bg-slate-950 rounded-[32px] p-3 shadow-2xl border-4 border-slate-800 flex flex-col relative overflow-hidden h-[540px]">
            
            {/* Smartphone Camera Notch */}
            <div className="absolute top-0 inset-x-0 h-4 flex justify-center z-30 pointer-events-none">
              <div className="w-20 h-3.5 bg-slate-800 rounded-b-xl" />
            </div>

            {/* WhatsApp Header Mock */}
            <div className="bg-[#075e54] text-white pt-5 pb-3 px-4 flex items-center justify-between rounded-t-[20px] select-none z-20">
              <div className="text-left">
                <h4 className="font-bold text-xs flex items-center gap-1 justify-start">
                  SubVision Alerts
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                </h4>
                <p className="text-[7px] text-teal-100 font-medium">En línea (Servirov OS Bot - Subvision)</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={clearPhoneLogs} 
                  title="Limpiar chat"
                  className="text-teal-200 hover:text-white text-[9px] font-bold uppercase bg-teal-800/50 px-2 py-0.5 rounded transition-all cursor-pointer"
                >
                  Limpiar
                </button>
                <div className="w-6 h-6 rounded-full bg-teal-800 flex items-center justify-center font-bold text-[10px] shadow-inner select-none">
                  SV
                </div>
              </div>
            </div>

            {/* Chat Messages Area (Simulates receiving live logs) */}
            <div className="flex-1 bg-[#ece5dd] p-3 overflow-y-auto space-y-3 relative min-h-[350px] flex flex-col-reverse rounded-b-[20px]">
              
              {/* Background image mockup style */}
              <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

              <div ref={phoneEndRef} />

              {/* Gemini typing indicator */}
              {apiLoading && (
                <div className="bg-white p-2.5 rounded-lg shadow-sm max-w-[85%] self-start text-slate-500 italic text-[10px] z-10 flex items-center gap-1.5 border border-slate-100 text-left">
                  <Loader2 className="w-3 h-3 text-cyan-600 animate-spin" />
                  <span>Analizando anomalía en SUBVISION...</span>
                </div>
              )}

              {/* Notification logs list */}
              {phoneMessages.length === 0 ? (
                <div className="text-center py-24 text-slate-400 font-mono text-[9px] select-none z-10 self-center">
                  Esperando disparador en la consola izquierda...
                </div>
              ) : (
                [...phoneMessages].reverse().map((notif) => {
                  return (
                    <div 
                      key={notif.id} 
                      className="p-2.5 rounded-lg shadow-sm max-w-[85%] leading-normal relative font-sans text-[10px] z-10 whitespace-pre-wrap text-left bg-white text-slate-700 self-start border border-slate-100"
                    >
                      {/* message */}
                      <p className="pr-4">{notif.message}</p>
                      
                      {/* details */}
                      <div className="flex items-center justify-end gap-1.5 mt-1.5 text-[8px] text-slate-400 font-mono">
                        <span>{notif.timestamp}</span>
                        <span>
                          {notif.status === 'sent' ? (
                            <Check className="w-3 h-3 text-slate-400" />
                          ) : notif.status === 'delivered' ? (
                            <CheckCheck className="w-3 h-3 text-slate-400" />
                          ) : (
                            <CheckCheck className="w-3 h-3 text-cyan-600" />
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              
              {/* Initial phone greetings */}
              <div className="bg-white border border-slate-100 p-2.5 rounded-lg shadow-sm max-w-[85%] self-start text-slate-700 text-[10px] z-10 text-left">
                <p>Hola. Dispositivo sincronizado para recibir alertas de la Consola SUBVISION en tiempo real.</p>
                <div className="mt-2 p-2 bg-cyan-50/50 rounded-lg border border-cyan-100 text-cyan-800 text-[9px] font-bold flex items-start gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-600 animate-pulse shrink-0 mt-0.5" />
                  <span>Gatille cualquier evento de la consola izquierda para visualizar la estructuración automática del sistema Subvision.</span>
                </div>
                <div className="text-right text-[8px] text-slate-400 font-mono mt-1.5">Conectado</div>
              </div>
              
            </div>

          </div>

          {/* Bottom instructions */}
          <div className="text-[10px] text-slate-400 font-mono text-center pt-4">
            Simulador de Dispositivo del Cliente
          </div>
        </div>

      </div>

    </div>
  );
};
