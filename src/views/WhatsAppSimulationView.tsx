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
  Cpu,
  Phone,
  Video,
  MoreVertical,
  Code,
  FileText,
  Image as ImageIcon,
  UserCheck,
  Zap,
  Volume2
} from 'lucide-react';
import { queryGroq } from '../lib/groq';

const GROQ_SYSTEM_INSTRUCTION = `Eres el módulo de monitoreo en tiempo real de la app SUBVISION de la empresa SERVIROV. Tu función es procesar los reportes de errores en las redes de pesca y estructurar alertas técnicas críticas de manera inmediata.

Cuando se reporte una anomalía o falla, debes generar un mensaje con la siguiente estructura exacta (omitiendo saludos, introducciones o lenguaje comercial):

🚨 ALERTA SUBVISION - SERVIROV 🚨
⚠️ ESTADO: [Tipo de Error / Anomalía detectada]
📍 UBICACIÓN/MÓDULO: [Indicar módulo o coordenada afectada]
⏱️ HORA REGISTRO: [Hora del evento]
⚙️ ACCIÓN REQUERIDA: REVISIÓN URGENTE EN TERRENO CON ROV.

Reglas operativas:
1. Sé extremadamente directo y conciso. Al ser un canal técnico industrial, no saludes ni te despidas.
2. Si los datos ingresados vienen incompletos, levanta la alerta de igual forma con la información que esté disponible.
3. Usa estrictamente la estructura de los emojis (🚨, ⚠️, 📍, ⏱️, ⚙️) para asegurar una lectura rápida en alta mar o terreno.`;

interface SimulatedAlertMessage {
  id: string;
  sender: 'system' | 'user';
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  photoUrl?: string;
  pdfAttached?: boolean;
  quickButtons?: { label: string; actionText: string }[];
}

const playChime = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {}
};

export const WhatsAppSimulationView: React.FC = () => {
  const { selectedCenter } = useApp();
  
  // Simulation states
  const [selectedAnomaly, setSelectedAnomaly] = useState<string>('malla-105');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('jefe-centro');
  const [attachROVPhoto, setAttachROVPhoto] = useState<boolean>(true);
  const [attachPDFReport, setAttachPDFReport] = useState<boolean>(false);
  const [showJsonInspector, setShowJsonInspector] = useState<boolean>(false);
  
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [showFlowPulse, setShowFlowPulse] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  
  // Chat History on the smartphone
  const [phoneMessages, setPhoneMessages] = useState<SimulatedAlertMessage[]>([]);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [phoneInputText, setPhoneInputText] = useState<string>('');
  const [isPhoneTyping, setIsPhoneTyping] = useState<boolean>(false);
  
  const phoneEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phoneEndRef.current) {
      phoneEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [phoneMessages, apiLoading, isPhoneTyping]);

  // Target Recipients
  const recipientsList = [
    { id: 'jefe-centro', name: 'Andrés Mansilla', role: 'Jefe de Centro Pilpilehue', phone: '+56 9 8765 4321', avatar: 'AM' },
    { id: 'piloto-rov', name: 'Cristian Barcena Córdova', role: 'Piloto ROV Terreno', phone: '+56 9 9876 5432', avatar: 'CB' },
    { id: 'central-servirov', name: 'Central Monitoreo SERVIROV', role: 'Gerencia de Operaciones', phone: '+56 9 5555 4444', avatar: 'SV' }
  ];

  const activeRecipient = recipientsList.find(r => r.id === selectedRecipient) || recipientsList[0];

  // Pre-configured anomalies data based on selectedCenter
  const anomaliesList = [
    {
      id: 'malla-105',
      title: 'Rotura Crítica en Malla Pecera (Módulo 103/105)',
      description: `Desgarro lineal de 1.2m en paño inferior a -20m profundidad. Integridad estructural reducida a 74.2%. Tensión de fondeo en 148.9 kN.`,
      severity: 'critical',
      photoUrl: '/report_pecera409.jpg'
    },
    {
      id: 'fondeo-b2',
      title: 'Sobretensión Extrema en Línea de Fondeo B2',
      description: `El sensor de tracción registra 148.9 kN en la línea B2 (límite máximo 120.0 kN). Desplazamiento angular por corriente marina de 1.8 nudos.`,
      severity: 'critical',
      photoUrl: '/report_ins311.png'
    },
    {
      id: 'oxigeno-bajo',
      title: 'Descenso Crítico de Oxígeno Disuelto',
      description: `Caída drástica de oxígeno en columna de agua a 4.8 mg/L (umbral óptimo > 6.5 mg/L). Corriente de agua reducida en perímetro este.`,
      severity: 'warning',
      photoUrl: '/report_j303.png'
    },
    {
      id: 'custom',
      title: 'Reporte Manual / Evento Personalizado',
      description: customDescription,
      severity: 'custom',
      photoUrl: '/report_ins301.png'
    }
  ];

  const activeAnomaly = anomaliesList.find(a => a.id === selectedAnomaly) || anomaliesList[0];

  const queryGroqForAlert = async (text: string): Promise<string> => {
    try {
      const userPrompt = `Incidente detectado: ${text}\nUbicación actual del centro: ${selectedCenter.name}, coordenadas: ${selectedCenter.coordinates}`;
      return await queryGroq(GROQ_SYSTEM_INSTRUCTION, userPrompt, 'llama-3.1-8b-instant');
    } catch (error: any) {
      console.error(error);
      return `🚨 ALERTA SUBVISION - SERVIROV 🚨\n⚠️ ESTADO: Desgarradura Crítica Malla Pecera\n📍 UBICACIÓN/MÓDULO: ${selectedCenter.name} (Módulo 103)\n⏱️ HORA REGISTRO: ${new Date().toLocaleTimeString().substring(0, 5)}\n⚙️ ACCIÓN REQUERIDA: REVISIÓN URGENTE EN TERRENO CON ROV.`;
    }
  };

  const handleTriggerAlert = async () => {
    const reportText = selectedAnomaly === 'custom' ? customDescription : activeAnomaly.description;
    if (!reportText.trim()) return;

    setIsTransmitting(true);
    setShowFlowPulse(true);
    setPipelineStep(1);

    setTimeout(() => setPipelineStep(2), 500);
    setTimeout(() => setPipelineStep(3), 1100);

    // Call Groq to structure the alert
    const structuredMessage = await queryGroqForAlert(reportText);

    setTimeout(() => {
      setPipelineStep(4);
      playChime();

      const newMsg: SimulatedAlertMessage = {
        id: `sim-${Date.now()}`,
        sender: 'system',
        message: structuredMessage,
        timestamp: new Date().toLocaleTimeString().substring(0, 5),
        status: 'sent',
        photoUrl: attachROVPhoto ? activeAnomaly.photoUrl : undefined,
        pdfAttached: attachPDFReport,
        quickButtons: [
          { label: '🛠️ Despachar Cuadrilla Buceo', actionText: 'Solicito despachar cuadrilla de buceo a terreno inmediatamente.' },
          { label: '📞 Contactar Piloto ROV', actionText: 'Por favor contactar al Piloto ROV para transmisión de video HD live.' },
          { label: '✅ Confirmar Recepción Alerta', actionText: 'Confirmo recepción de la alerta de seguridad marítima.' }
        ]
      };

      setPhoneMessages(prev => [...prev, newMsg]);
      setApiLoading(false);
      setIsTransmitting(false);

      // Simulate WhatsApp delivery status updates
      setTimeout(() => {
        setPhoneMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m));
      }, 800);

      setTimeout(() => {
        setPhoneMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m));
      }, 1800);
    }, 1400);
  };

  const handleSendPhoneMessage = (textToSend?: string) => {
    const text = textToSend || phoneInputText;
    if (!text.trim()) return;

    const userMsg: SimulatedAlertMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      message: text.trim(),
      timestamp: new Date().toLocaleTimeString().substring(0, 5),
      status: 'read'
    };

    setPhoneMessages(prev => [...prev, userMsg]);
    if (!textToSend) setPhoneInputText('');
    setIsPhoneTyping(true);

    setTimeout(() => {
      playChime();
      setIsPhoneTyping(false);
      setPhoneMessages(prev => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          sender: 'system',
          message: `✅ Central SERVIROV: Entendido. Registro ingresado en bitácora para ${activeRecipient.name}. Se han activado los protocolos de seguridad.`,
          timestamp: new Date().toLocaleTimeString().substring(0, 5),
          status: 'read'
        }
      ]);
    }, 1300);
  };

  const clearPhoneLogs = () => {
    setPhoneMessages([]);
    setPipelineStep(0);
  };

  // Generated Meta WhatsApp API Payload mockup
  const metaPayloadMock = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: activeRecipient.phone.replace(/[^0-9+]/g, ''),
    type: "template",
    template: {
      name: "subvision_critical_alert_v2",
      language: { code: "es" },
      components: [
        {
          type: "header",
          parameters: attachROVPhoto ? [{ type: "image", image: { link: `https://subvision.servirov.cl${activeAnomaly.photoUrl}` } }] : []
        },
        {
          type: "body",
          parameters: [
            { type: "text", text: activeAnomaly.title },
            { type: "text", text: selectedCenter.name },
            { type: "text", text: new Date().toLocaleTimeString().substring(0, 5) }
          ]
        }
      ]
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-[calc(100vh-73px)] animate-fade-in text-xs p-6 space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-600 animate-pulse" />
            Simulador de Automatización WhatsApp Live
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Flujo de automatización de alertas en tiempo real: de la Consola Subvision a la API de WhatsApp Cloud y al dispositivo móvil del cliente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJsonInspector(!showJsonInspector)}
            className={`px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 border ${
              showJsonInspector ? 'bg-slate-900 text-cyan-400 border-slate-800 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Code className="w-4 h-4 text-cyan-500" />
            <span>{showJsonInspector ? 'Ocultar JSON Meta Payload' : 'Ver JSON Meta Payload'}</span>
          </button>
        </div>
      </div>

      {/* JSON Payload Inspector Slide-down Banner */}
      {showJsonInspector && (
        <div className="bg-slate-900 text-cyan-400 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] shadow-2xl animate-fade-in space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-white font-bold text-xs">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Meta WhatsApp Cloud API HTTP POST Request Payload (v18.0)
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              HTTPS 200 OK
            </span>
          </div>
          <pre className="overflow-x-auto text-slate-300 leading-relaxed max-h-48 p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
            {JSON.stringify(metaPayloadMock, null, 2)}
          </pre>
        </div>
      )}

      {/* Dual Panel Layout */}
      <div className="flex-1 flex flex-col xl:flex-row items-stretch gap-6 justify-center">
        
        {/* Left Panel: Console App / System */}
        <div className="flex-1 bg-white border border-slate-100 rounded-3xl p-6 shadow-premium flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          
          <div className="space-y-5 relative z-10">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-slate-900 text-slate-100 rounded-lg p-1.5 flex items-center justify-center shadow-sm">
                  <Server className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] leading-tight">Consola de Control SUBVISION</h3>
                  <p className="text-slate-400 text-[9px]">Gatillador de Alertas Críticas de Seguridad (Servirov OS)</p>
                </div>
              </div>
              
              <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold bg-slate-900 text-cyan-400 border border-slate-800 tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                LIVE PIPELINE
              </span>
            </div>

            {/* Target Recipient Selector */}
            <div className="space-y-2 text-left">
              <label className="text-slate-500 font-bold uppercase text-[9px] flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
                Destinatario de la Alerta (Dispositivo Cliente/Piloto)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {recipientsList.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRecipient(r.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      selectedRecipient === r.id 
                        ? 'border-cyan-500 bg-cyan-50/20 shadow-sm ring-1 ring-cyan-500/30' 
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {r.avatar}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-slate-800 text-[11px] truncate">{r.name}</div>
                      <div className="text-[9px] text-slate-400 font-mono truncate">{r.phone}</div>
                    </div>
                  </button>
                ))}
              </div>
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
                    {activeAnomaly.severity === 'critical' ? 'Alerta Crítica Terreno' : 'Advertencia del Sensor'}
                  </span>
                  <h4 className="font-bold text-slate-800 text-xs">{activeAnomaly.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-mono mt-1">
                    {selectedAnomaly === 'custom' ? (customDescription || 'Escriba un reporte manual en el campo inferior para gatillar la simulación...') : activeAnomaly.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Anomaly selector */}
            <div className="space-y-3 text-left">
              <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[9px] flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Seleccionar Incidente para Simular
              </h5>
              
              <div className="grid grid-cols-1 gap-2">
                {anomaliesList.map(a => (
                  <label 
                    key={a.id} 
                    className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
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
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white text-xs font-mono"
                  />
                </div>
              )}
            </div>

            {/* Media Attachment Toggles */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={attachROVPhoto} 
                  onChange={(e) => setAttachROVPhoto(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500 border-slate-300"
                />
                <span className="text-slate-700 font-semibold flex items-center gap-1 text-[11px]">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-600" />
                  Adjuntar Foto ROV
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={attachPDFReport} 
                  onChange={(e) => setAttachPDFReport(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500 border-slate-300"
                />
                <span className="text-slate-700 font-semibold flex items-center gap-1 text-[11px]">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  Adjuntar Reporte PDF
                </span>
              </label>
            </div>

          </div>

          {/* Trigger Button and Live Pipeline Steps */}
          <div className="pt-4 border-t border-slate-100 relative z-10 space-y-3">
            
            {/* Live Pipeline Steps Bar */}
            <div className="grid grid-cols-4 gap-1.5 text-center text-[9px] font-mono">
              <div className={`p-1.5 rounded-lg border transition-all ${pipelineStep >= 1 ? 'bg-cyan-500 text-white border-cyan-600 font-bold' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                1. Consola
              </div>
              <div className={`p-1.5 rounded-lg border transition-all ${pipelineStep >= 2 ? 'bg-cyan-500 text-white border-cyan-600 font-bold' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                2. AI Groq
              </div>
              <div className={`p-1.5 rounded-lg border transition-all ${pipelineStep >= 3 ? 'bg-cyan-500 text-white border-cyan-600 font-bold' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                3. Meta Cloud API
              </div>
              <div className={`p-1.5 rounded-lg border transition-all ${pipelineStep >= 4 ? 'bg-emerald-500 text-white border-emerald-600 font-bold' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                4. Recibido ✓✓
              </div>
            </div>

            <button
              onClick={handleTriggerAlert}
              disabled={isTransmitting || (selectedAnomaly === 'custom' && !customDescription.trim())}
              className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer disabled:bg-slate-400 disabled:shadow-none"
            >
              {isTransmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Transmitiendo Alerta a {activeRecipient.name}...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-cyan-400" />
                  <span>Enviar Alerta Live a WhatsApp ({activeRecipient.phone})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Center Section: Flow Arrow Indicator */}
        <div className="flex xl:flex-col items-center justify-center shrink-0 gap-2 select-none py-2 xl:py-0">
          <div className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-slate-200/80">
            <Cpu className="w-4 h-4 text-cyan-600 animate-spin" />
            <span>Meta WhatsApp Cloud Gateway</span>
          </div>
          
          <div className="h-0.5 w-12 xl:w-0.5 xl:h-32 bg-slate-200 relative flex items-center justify-center">
            {showFlowPulse && (
              <span className="absolute block rounded-full bg-cyan-500 shadow-lg shadow-cyan-400/50 animate-ping h-5 w-5" />
            )}
            <ArrowRight className="w-5 h-5 text-cyan-600 rotate-0 xl:rotate-90 animate-bounce" />
          </div>
        </div>

        {/* Right Panel: Smartphone Screen / Ultra-realistic WhatsApp */}
        <div className="w-[340px] bg-slate-950 rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-700 flex flex-col relative overflow-hidden shrink-0 mx-auto min-h-[640px]">
          
          {/* Smartphone Camera Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center gap-2 border border-slate-800 pointer-events-none">
            <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full" />
            <div className="w-1.5 h-1.5 bg-cyan-900/60 rounded-full" />
          </div>

          {/* Screen Body */}
          <div className="flex-1 rounded-[38px] bg-[#efeae2] flex flex-col overflow-hidden relative font-sans">
            
            {/* Phone Status Bar */}
            <div className="h-9 bg-[#075e54] text-white px-6 pt-2.5 flex justify-between items-center text-[10px] font-mono font-semibold z-20 select-none">
              <span>{new Date().toLocaleTimeString().substring(0, 5)}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold">5G</span>
                <div className="w-4 h-2 bg-white rounded-xs" />
              </div>
            </div>

            {/* WhatsApp App Verified Header */}
            <div className="bg-[#075e54] text-white px-3 py-2.5 flex items-center justify-between shadow-md z-20 select-none border-b border-teal-800">
              <div className="flex items-center gap-2.5">
                <div className="relative rounded-full bg-white border border-teal-300 flex items-center justify-center overflow-hidden shrink-0 shadow-sm" style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px' }}>
                  <img src="/LOGO_CIRCULAR.png" alt="Servirov Logo" className="w-full h-full object-cover" style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', display: 'block' }} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-xs leading-tight tracking-tight">SERVIROV Operaciones</h4>
                    <span className="bg-emerald-400 text-teal-950 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black" title="Cuenta de Empresa Verificada">
                      ✓
                    </span>
                  </div>
                  <span className="text-[8px] text-teal-100/90 leading-none block mt-0.5">
                    {isPhoneTyping ? 'escribiendo...' : `Para: ${activeRecipient.name}`}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-white/90">
                <button 
                  onClick={clearPhoneLogs} 
                  title="Limpiar Chat"
                  className="text-teal-100 hover:text-white text-[8px] font-bold uppercase bg-teal-800/80 px-2 py-0.5 rounded transition-all cursor-pointer border border-teal-700"
                >
                  Limpiar
                </button>
                <Video className="w-3.5 h-3.5 cursor-pointer" />
                <Phone className="w-3 h-3 cursor-pointer" />
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 relative flex flex-col bg-[#efeae2]">
              
              {/* WhatsApp Date Badge */}
              <div className="mx-auto bg-white/80 backdrop-blur-xs text-slate-600 text-[9px] px-3 py-0.5 rounded-md shadow-xs font-bold uppercase tracking-wider my-1 select-none border border-slate-200/50">
                HOY
              </div>

              {phoneMessages.length === 0 ? (
                <div className="text-center py-20 text-slate-400 font-mono text-[9px] select-none z-10 self-center space-y-2">
                  <Activity className="w-6 h-6 text-slate-300 mx-auto animate-pulse" />
                  <p>Dispositivo de <strong>{activeRecipient.name}</strong> sincronizado.</p>
                  <span className="text-[8px] text-slate-400 block">Presione "Enviar Alerta Live" para transmitir.</span>
                </div>
              ) : (
                phoneMessages.map((notif) => {
                  if (notif.sender === 'system') {
                    const lines = notif.message.split('\n');
                    return (
                      <div 
                        key={notif.id} 
                        className="self-start max-w-[92%] bg-white rounded-r-xl rounded-bl-xl p-3 shadow-md relative border-l-4 border-red-500 text-xs animate-fade-in text-left"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-1.5">
                          <span className="text-red-600 font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                            ALERTA AUTOMÁTICA
                          </span>
                          <span className="text-[8px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded font-mono">
                            LIVE
                          </span>
                        </div>

                        {/* Photo Attachment if enabled */}
                        {notif.photoUrl && (
                          <div className="mb-2 rounded-lg overflow-hidden border border-slate-200 relative group">
                            <img src={notif.photoUrl} alt="ROV Snapshot" className="w-full h-28 object-cover" />
                            <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 text-[8px] text-white font-mono flex justify-between">
                              <span>📸 Registro ROV</span>
                              <span className="text-cyan-400 font-bold">SUBVISION</span>
                            </div>
                          </div>
                        )}

                        {/* PDF Attachment preview if enabled */}
                        {notif.pdfAttached && (
                          <div className="mb-2 p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-red-600 shrink-0" />
                              <div>
                                <div className="font-bold text-slate-800 leading-tight">Informe_Subvision_{selectedCenter.name.replace('Centro ', '')}.pdf</div>
                                <span className="text-[8px] text-slate-400 font-mono">PDF • 184 KB</span>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold text-cyan-600">Abrir</span>
                          </div>
                        )}

                        <div className="space-y-1 font-sans text-slate-800 text-[10px] leading-relaxed">
                          {lines.map((line, idx) => (
                            <p key={idx} className={line.startsWith('🚨') ? 'font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1' : ''}>
                              {line}
                            </p>
                          ))}
                        </div>

                        {/* Quick Reply Buttons */}
                        {notif.quickButtons && notif.quickButtons.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                            {notif.quickButtons.map((btn, bIdx) => (
                              <button
                                key={bIdx}
                                onClick={() => handleSendPhoneMessage(btn.actionText)}
                                className="w-full py-1.5 px-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[9px] font-bold rounded-lg border border-teal-200 transition-all flex items-center justify-between cursor-pointer active:scale-98"
                              >
                                <span>{btn.label}</span>
                                <span className="text-teal-600 font-bold">→</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-1 mt-1.5 text-[8px] text-slate-400 font-mono">
                          <span>{notif.timestamp}</span>
                          {notif.status === 'sent' ? <Check className="w-3 h-3 text-slate-400" /> : <CheckCheck className="w-3 h-3 text-cyan-600" />}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div 
                        key={notif.id} 
                        className="self-end max-w-[85%] bg-[#dcf8c6] rounded-l-xl rounded-br-xl p-2 shadow-sm relative text-xs text-slate-800 animate-fade-in text-left"
                      >
                        <p className="text-[10px] leading-relaxed break-words font-medium">{notif.message}</p>
                        <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-slate-500 font-mono">
                          <span>{notif.timestamp}</span>
                          <CheckCheck className="w-3 h-3 text-cyan-600" />
                        </div>
                      </div>
                    );
                  }
                })
              )}

              {isPhoneTyping && (
                <div className="self-start bg-white/90 rounded-2xl px-3 py-2 shadow-xs text-[10px] text-slate-500 font-medium flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}

              <div ref={phoneEndRef} />
            </div>

            {/* WhatsApp Interactive Input Footer */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPhoneMessage();
              }} 
              className="p-2 bg-[#f0f2f5] flex items-center gap-2 border-t border-slate-200"
            >
              <input
                type="text"
                value={phoneInputText}
                onChange={(e) => setPhoneInputText(e.target.value)}
                placeholder="Escribe un mensaje en WhatsApp..."
                className="flex-1 bg-white rounded-full px-3.5 py-1.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
              />
              <button
                type="submit"
                disabled={!phoneInputText.trim()}
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all cursor-pointer ${
                  phoneInputText.trim() ? 'bg-[#128c7e] text-white hover:bg-[#075e54] scale-105' : 'bg-slate-300 text-slate-100 cursor-not-allowed'
                }`}
                title="Enviar mensaje"
              >
                <Send className="w-3.5 h-3.5 transform rotate-45 -translate-x-0.5" />
              </button>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
};

