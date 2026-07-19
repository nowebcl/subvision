import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Share2, 
  Plus, 
  ToggleLeft, 
  ToggleRight, 
  Trash2, 
  Send, 
  Check, 
  CheckCheck, 
  Loader2,
  Brain
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

export const WhatsAppAutomationsView: React.FC = () => {
  const { 
    selectedCenter, 
    waRules, 
    waNotifications, 
    addWaRule, 
    toggleWaRule, 
    deleteWaRule, 
    triggerWaNotification
  } = useApp();

  const [parameter, setParameter] = useState<'integrity' | 'mooring' | 'oxygen' | 'current'>('integrity');
  const [condition, setCondition] = useState<'less_than' | 'greater_than'>('less_than');
  const [threshold, setThreshold] = useState(85);
  const [recipient, setRecipient] = useState('+56 9 9629 9010');
  const [customMsg, setCustomMsg] = useState('');
  
  // Groq AI States
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [useGroqForManual, setUseGroqForManual] = useState(true);
  const groqModel = 'llama-3.1-8b-instant';
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when new notifications/messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [waNotifications, chatLoading]);

  const queryGroqAPI = async (userText: string): Promise<string> => {
    try {
      return await queryGroq(GROQ_SYSTEM_INSTRUCTION, userText, groqModel);
    } catch (error: any) {
      console.error(error);
      return `🚨 ALERTAS SUBVISION - SERVIROV 🚨\n⚠️ ESTADO: Error en motor de IA (Groq)\n📍 UBICACIÓN/MÓDULO: API Subvision\n⏱️ HORA REGISTRO: ${new Date().toLocaleTimeString().substring(0, 5)}\n⚙️ ACCIÓN REQUERIDA: ${error.message || error}`;
    }
  };

  const handleSendChatbotMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatLoading(true);

    const targetRecipient = recipient || '+56 9 9629 9010';
    
    // Add user message to notifications list
    triggerWaNotification(userText, targetRecipient, 'user');

    // Query Groq
    const botReply = await queryGroqAPI(userText);

    // Add bot response to notifications list
    triggerWaNotification(botReply, targetRecipient, 'bot');
    setChatLoading(false);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) return;

    addWaRule({
      centerId: selectedCenter.id,
      parameter,
      condition,
      threshold,
      recipient,
      active: true
    });

    setRecipient('+56 9 9629 9010');
  };

  const handleSendManualWa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg) return;

    const msg = customMsg.trim();
    setCustomMsg('');
    setIsAiProcessing(true);

    const targetRecipient = recipient || '+56 9 9629 9010';

    if (useGroqForManual) {
      const structuredAlert = await queryGroqAPI(msg);
      triggerWaNotification(structuredAlert, targetRecipient, 'bot');
    } else {
      triggerWaNotification(
        `💬 MENSAJE MANUAL DE OPERACIONES SUBVISION: ${msg}`,
        targetRecipient,
        'bot'
      );
    }
    setIsAiProcessing(false);
  };

  const getParamLabel = (p: string) => {
    switch (p) {
      case 'integrity': return 'Integridad de Malla';
      case 'mooring': return 'Tensión de Fondeo';
      case 'oxygen': return 'Oxígeno Disuelto';
      case 'current': return 'Velocidad de Corriente';
      default: return p;
    }
  };

  return (
    <div className="flex-1 flex bg-slate-50 min-h-[calc(100vh-73px)] animate-fade-in text-xs">
      
      {/* Rule Builder Panel (Left) */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-73px)]">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Share2 className="w-6 h-6 text-cyan-600 animate-pulse" />
            Automatizaciones & Alertas de WhatsApp
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Configure reglas de telemetría y simule reportes de anomalías procesados en tiempo real por el chatbot de inteligencia artificial.
          </p>
        </div>



        {/* n8n integration removed */}

        {/* Rule creation form */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2.5">
            Crear Nueva Regla de Monitoreo
          </h3>
          <form onSubmit={handleCreateRule} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            {/* Param Select */}
            <div className="space-y-1.5 text-left">
              <label className="text-slate-500 font-semibold block uppercase">Parámetro Sensor</label>
              <select
                value={parameter}
                onChange={(e: any) => setParameter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="integrity">Integridad Mallas (%)</option>
                <option value="mooring">Tensión Fondeo (kN)</option>
                <option value="oxygen">Oxígeno Disuelto (mg/L)</option>
                <option value="current">Velocidad Corriente (nudos)</option>
              </select>
            </div>

            {/* Condition Select */}
            <div className="space-y-1.5 text-left">
              <label className="text-slate-500 font-semibold block uppercase">Condición</label>
              <select
                value={condition}
                onChange={(e: any) => setCondition(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="less_than">Menor que (&lt;)</option>
                <option value="greater_than">Mayor que (&gt;)</option>
              </select>
            </div>

            {/* Threshold Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-slate-500 font-semibold block uppercase">Umbral de Alerta</label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all"
              />
            </div>

            {/* Recipient Phone */}
            <div className="space-y-1.5 text-left">
              <label className="text-slate-500 font-semibold block uppercase">Número Teléfono Destinatario</label>
              <input
                type="text"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Ej. +56 9 8888 7777"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all"
              />
            </div>

            {/* Button */}
            <div className="md:col-span-4 flex justify-end">
              <button
                type="submit"
                className="py-2.5 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Regla de Notificación</span>
              </button>
            </div>

          </form>
        </div>

        {/* Rules List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2.5">
            Reglas de Triggers Activas
          </h3>

          <div className="space-y-3">
            {waRules.length === 0 ? (
              <div className="text-center py-6 text-slate-400 font-mono">No hay reglas de WhatsApp creadas.</div>
            ) : (
              waRules.map(rule => (
                <div key={rule.id} className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">
                        Si {getParamLabel(rule.parameter)} es {rule.condition === 'less_than' ? 'Menor que (<)' : 'Mayor que (>)'} {rule.threshold}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                        rule.active ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {rule.active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Enviar WhatsApp a: <span className="font-medium text-slate-600">{rule.recipient}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleWaRule(rule.id)}
                      title="Activar/Desactivar regla"
                      className="text-slate-400 hover:text-cyan-600 transition-colors"
                    >
                      {rule.active ? <ToggleRight className="w-6 h-6 text-cyan-500" /> : <ToggleLeft className="w-6 h-6 text-slate-300" />}
                    </button>
                    <button
                      onClick={() => deleteWaRule(rule.id)}
                      title="Eliminar regla"
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Manual notification section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-2.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-left">
              Mensajería WhatsApp de Prueba (Manual)
            </h3>
            
            <div className="flex items-center gap-3 flex-wrap">


              {/* Gemini/Groq Integration Toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] font-semibold text-slate-500">
                <input
                  type="checkbox"
                  checked={useGroqForManual}
                  onChange={(e) => setUseGroqForManual(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 h-3.5 w-3.5"
                />
                <span className="flex items-center gap-0.5 text-cyan-700 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded">
                  Procesar con IA
                </span>
              </label>
            </div>
          </div>

          <form onSubmit={handleSendManualWa} className="flex gap-4">
            <input
              type="text"
              required
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              disabled={isAiProcessing}
              placeholder={useGroqForManual ? "Escriba un evento (ej. 'red rota en jaula 105 hace 10 min') para estructurar la alerta..." : "Escriba un mensaje de alerta manual de WhatsApp..."}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all text-xs disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isAiProcessing || !customMsg.trim()}
              className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0 disabled:bg-slate-400"
            >
              {isAiProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Alerta</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* WhatsApp Smartphone Simulator (Right) */}
      <div className="w-80 bg-slate-100 border-l border-slate-200 p-4 flex flex-col justify-between shrink-0 shadow-inner">
        
        {/* The Smartphone Frame */}
        <div className="flex-1 bg-slate-950 rounded-[32px] p-3 shadow-2xl border-4 border-slate-800 flex flex-col relative overflow-hidden max-h-[580px]">
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
            <div className="w-6 h-6 rounded-full bg-teal-800 flex items-center justify-center font-bold text-[10px] shadow-inner select-none">
              SV
            </div>
          </div>

          {/* Chat Messages Area (Simulates receiving live logs) */}
          <div className="flex-1 bg-[#ece5dd] p-3 overflow-y-auto space-y-3 relative min-h-[300px] flex flex-col-reverse">
            
            {/* Background image mockup style */}
            <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

            <div ref={messagesEndRef} />

            {/* Gemini typing indicator */}
            {chatLoading && (
              <div className="bg-white p-2.5 rounded-lg shadow-sm max-w-[85%] self-start text-slate-500 italic text-[10px] z-10 flex items-center gap-1.5 border border-slate-100 text-left">
                <Loader2 className="w-3 h-3 text-cyan-600 animate-spin" />
                <span>Estructurando alerta Subvision...</span>
              </div>
            )}

            {/* Notification logs list */}
            {waNotifications.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-mono text-[9px] select-none z-10 self-center">
                Esperando triggers automáticos o envíos manuales...
              </div>
            ) : (
              waNotifications.map((notif) => {
                const isUser = notif.sender === 'user';
                return (
                  <div 
                    key={notif.id} 
                    className={`p-2.5 rounded-lg shadow-sm max-w-[85%] leading-normal relative font-sans text-[10px] z-10 whitespace-pre-wrap text-left ${
                      isUser 
                        ? 'bg-[#dcf8c6] text-slate-800 self-end' 
                        : 'bg-white text-slate-700 self-start border border-slate-100'
                    }`}
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
              <p>Hola. Canal de notificaciones de WhatsApp para el sistema operativo SubVision activo. Recibirá aquí las alertas configuradas por tracción de fondeo y desgastes de mallas.</p>
              <div className="mt-2 p-2 bg-cyan-50/50 rounded-lg border border-cyan-100 text-cyan-800 text-[9px] font-bold flex items-start gap-1.5">
                <Brain className="w-3.5 h-3.5 text-cyan-600 animate-pulse shrink-0 mt-0.5" />
                <span>Puedes chatear directamente conmigo aquí para registrar anomalías o consultar estados en lenguaje natural.</span>
              </div>
              <div className="text-right text-[8px] text-slate-400 font-mono mt-1.5">Sincronizado</div>
            </div>
            
          </div>

          {/* Interactive Chat Input Bar inside Phone */}
          <form onSubmit={handleSendChatbotMsg} className="bg-[#ece5dd] px-2 pb-3 pt-1.5 flex items-center gap-1.5 rounded-b-[20px] border-t border-slate-200/20 z-20">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
              placeholder="Reporte un evento aquí..."
              className="flex-1 px-3 py-2 bg-white border border-slate-100 rounded-full focus:outline-none focus:ring-1 focus:ring-cyan-600 text-[10px] placeholder:text-slate-400 text-slate-800 shadow-sm disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="w-7 h-7 bg-[#075e54] hover:bg-[#128c7e] text-white rounded-full flex items-center justify-center shadow transition-all shrink-0 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

        {/* Bottom instructions */}
        <div className="text-[10px] text-slate-400 font-mono text-center pt-4">
          Simulador móvil de alertas Servirov
        </div>
      </div>

    </div>
  );
};
