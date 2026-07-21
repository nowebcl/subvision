import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { queryGroq } from '../../lib/groq';
import { Bot, Send, X, Share2, Check, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export const AIChatbotWidget: React.FC = () => {
  const { rovReports, selectedCenter, triggerWaNotification } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // States for the custom email flow
  const [reportFlowStep, setReportFlowStep] = useState<number>(0); // 0 = idle, 1 = awaiting email, 2 = awaiting report choice
  const [targetEmail, setTargetEmail] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message (highly human-like and Chilean-accented)
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: `🤖 ¡Buenas tardes, colega! Soy tu copiloto técnico de SubVision.

Estoy aquí para darte una mano con la telemetría, revisar el estado de las mallas, ver los tensores de fondeo o lo que sea que necesites acá en el centro.

Dime si quieres que revisemos:
• ¿Cómo andan las mallas del centro hoy?
• ¿Qué reportes críticos tenemos registrados?
• Cuéntame sobre el Módulo 103.

¡Conversemos con confianza! Y si necesitas que despachemos un informe técnico en PDF al correo de la empresa, dímelo al tiro y lo gestionamos de una.`,
          timestamp: new Date()
        }
      ]);
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSelectReportForEmail = (cage: any) => {
    setLoading(true);

    // 1. Add user choice message to logs
    const userChoiceMsg: ChatMessage = {
      id: `msg-${Date.now()}-u-choice`,
      sender: 'user',
      text: `Selecciono el informe del ${cage.name.replace('Jaula', 'Módulo')}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userChoiceMsg]);

    // 2. Simulate compiling and preparing
    setTimeout(() => {
      const prepMsg: ChatMessage = {
        id: `msg-${Date.now()}-b-prep`,
        sender: 'bot',
        text: `¡Excelente, colega! Estoy compilando los datos de telemetría de agua, el perfil estructural y el registro de inspecciones del **${cage.name.replace('Jaula', 'Módulo')}** en un documento PDF adjunto...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, prepMsg]);

      // 3. Complete email dispatch simulation
      setTimeout(() => {
        const successMsg: ChatMessage = {
          id: `msg-${Date.now()}-b-success`,
          sender: 'bot',
          text: `📧 **¡Correo enviado con éxito, colega!**\n\nEl informe técnico del **${cage.name.replace('Jaula', 'Módulo')}** ha sido despachado en formato PDF a la dirección **${targetEmail}** de manera segura.\n\n¡Quedó listo y enviado! ¿Revisamos algún otro módulo o línea de fondeo?`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMsg]);
        setToastMessage("Correo enviado");

        // Reset flow
        setReportFlowStep(0);
        setTargetEmail('');
        setLoading(false);
        
        setTimeout(() => setToastMessage(null), 4000);
      }, 1500);

    }, 800);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return;

    const userText = inputValue;
    setInputValue('');
    
    // Append user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // --- CHECK REPORT FLOW STATE ---
    if (reportFlowStep === 1) {
      // User is providing the email address
      const emailInput = userText.trim();
      setTargetEmail(emailInput);
      setReportFlowStep(2);
      setLoading(false);

      setTimeout(() => {
        const botMsg: ChatMessage = {
          id: `msg-${Date.now()}-b-email-ok`,
          sender: 'bot',
          text: `¡De lujo! Anoté el correo: **${emailInput}**.\n\nAhora, dime cuál de los informes de los módulos del centro te gustaría adjuntar y enviar. Por favor, selecciona una de las siguientes opciones de módulos activos:`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      }, 500);
      return;
    }

    // --- DETECT DESIRE TO GET REPORT / EMAIL ---
    const lowerText = userText.toLowerCase();
    const wantsReport = lowerText.includes('informe') || lowerText.includes('reporte') || lowerText.includes('pdf') || lowerText.includes('correo') || lowerText.includes('mail') || lowerText.includes('enviar') || lowerText.includes('despachar');

    if (reportFlowStep === 0 && wantsReport) {
      setReportFlowStep(1);
      setLoading(false);

      setTimeout(() => {
        const botMsg: ChatMessage = {
          id: `msg-${Date.now()}-b-ask-email`,
          sender: 'bot',
          text: `¡Por supuesto, colega! Te preparo el despacho del PDF de inmediato. Dime, ¿a qué dirección de correo electrónico quieres que envíe el reporte técnico?`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      }, 500);
      return;
    }

    // --- DEFAULT BOT CHAT LOGIC ---
    try {
      // Gather active reports text context
      const centerReports = rovReports.filter(r => r.centroId === selectedCenter.id);
      const reportsContext = centerReports.length > 0
        ? centerReports.map((r, i) => `Informe ${i + 1}: ${r.nombre} (Fecha: ${r.fecha}, Piloto: ${r.piloto}, Puerto/Estado: ${r.puerto}, Detalle: ${r.redes})`).join('\n')
        : 'No hay informes registrados en este centro de cultivo.';

      // Gather cages integrity status
      const cagesContext = selectedCenter.cages.slice(0, 3).map(c => `Módulo: ${c.name.replace('Jaula', 'Módulo')}, Especie: ${c.species}, Densidad: ${c.count} peces, Integridad Malla: ${c.netIntegrity}%, Estado General: ${c.status.toUpperCase()}`).join('\n');

      // Mooring lines status
      const mooringContext = selectedCenter.mooringLines.map(m => `Fondeo: ${m.code}, Tensión: ${m.tensionKn} kN (Límite: ${m.limitKn} kN), Estado: ${m.status.toUpperCase()}`).join('\n');

      // Water params
      const waterContext = `Temperatura: ${selectedCenter.waterParams.temperature}°C, Oxígeno Disuelto: ${selectedCenter.waterParams.dissolvedOxygen} mg/L, pH: ${selectedCenter.waterParams.ph}, Velocidad Corriente: ${selectedCenter.waterParams.currentSpeed} nudos.`;

      // Construct system prompt with fluid, human-like instructions (Chilean accent)
      const systemPrompt = `Eres el Asistente Inteligente de SUBVISION (plataforma de SERVIROV). Tu misión es ayudar al operador a evaluar informes técnicos, telemetrías y la seguridad de los módulos.

DATOS DEL CENTRO ACTIVO:
- Centro: ${selectedCenter.name}
- Ubicación: ${selectedCenter.location}, ${selectedCenter.region}
- Coordenadas: ${selectedCenter.coordinates}

TELEMETRÍA DE AGUA EN VIVO:
${waterContext}

ESTADO DE INTEGRIDAD DE MÓDULOS (LIMITADO A 3 MÓDULOS):
${cagesContext}

LÍNEAS DE ANCLAJE Y FONDEOS:
${mooringContext}

HISTORIAL DE INFORMES DE ROV EN ESTE CENTRO:
${reportsContext}

DIRECTRICES DE PERSONALIDAD Y TONO (MUY IMPORTANTE):
1. ¡No seas robótico, frío ni demasiado formal! Háblale al operador como un colega supervisor chileno del sur del país (Puerto Montt, Chiloé) experto en acuicultura: de manera fluida, natural, empática y cercana. Usa términos profesionales del sector junto con modismos amigables como "colega", "al tiro", "de lujo", "chiquillos", "hacer el aguante".
2. Evita listados de datos secos. Explica qué significan los números (ej. si la integridad de la malla del Módulo 103 está en 74.2%, explícale con tono de advertencia que eso es crítico y requiere parche o costura de inmediato para evitar escapes).
3. Si el usuario pide enviar un informe o un PDF, indícale amablemente que le puedes despachar el PDF al correo de inmediato y dile algo así como "Escríbeme 'enviar informe' y lo gestionamos al tiro".`;

      // Call API (DeepSeek model)
      const reply = await queryGroq(systemPrompt, userText);

      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}-b`,
        sender: 'bot',
        text: reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'bot',
        text: `Disculpa, colega, tuve un pequeño percance al procesar los datos de telemetría: ${err.message || 'No pude conectarme al servidor de IA.'}. ¿Probamos nuevamente?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleShareToWhatsApp = (text: string) => {
    const recipient = "+56 9 8472 9011";
    
    const cleanText = text
      .replace(/👋|✨|🟢|🔴|⚠️|🤖|👋/g, '')
      .replace(/•/g, '-')
      .substring(0, 200) + "...";

    const alertMessage = `📢 [INFORME SUBVISION] Enviado desde Asistente AI:\n\n${cleanText}`;
    triggerWaNotification(alertMessage, recipient, 'bot');
    
    setToastMessage("Enviado al simulador de WhatsApp!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <>
      {/* Floating Action Button (FAB) and Tooltip Container - Tooltip always visible when closed */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center h-13">
        {!isOpen && (
          <div 
            onClick={() => {
              setIsOpen(true);
            }}
            className="mr-4 bg-white border border-cyan-500/30 text-cyan-800 text-[10.5px] font-bold px-3.5 py-2 rounded-xl shadow-[0_4px_20px_rgba(6,182,212,0.3)] whitespace-nowrap flex items-center gap-2 cursor-pointer animate-bounce hover:bg-slate-50 transition-all select-none border-l-4 border-l-cyan-500"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shrink-0" />
            <span>¿Necesitas ayuda?</span>
          </div>
        )}
        
        <button
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          className="w-13 h-13 bg-gradient-to-tr from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_25px_rgba(6,182,212,0.55)] transition-all duration-300 scale-105 hover:scale-110 relative shrink-0"
          title="Copiloto AI"
        >
          {isOpen ? (
            <X className="w-5.5 h-5.5 text-white transition-transform duration-300 rotate-90" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Bot className="w-5.5 h-5.5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-[0_0_8px_#10b981]" />
            </div>
          )}
        </button>
      </div>

      {/* Floating Smartphone Screen Simulator - WHITE VERSION */}
      <div
        className={`fixed bottom-24 right-6 w-[390px] h-[640px] max-h-[calc(100vh-130px)] bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-[28px] overflow-hidden z-40 shadow-[0_20px_50px_rgba(15,23,42,0.15)] flex flex-col justify-between transition-all duration-300 ease-out transform ${
          isOpen 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
            : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
        }`}
      >
        {/* Subtle Decorative Glow in Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Clean Light-Theme Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-8.5 h-8.5 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shadow-sm">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">SubVision Copilot</h3>
              <span className="text-[7.5px] font-mono text-cyan-600 flex items-center gap-1.5 mt-0.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                DEEPSEEK V3 ACTIVE
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Conversation Logs */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4.5 z-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[90%] ${
                msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl text-[11.5px] leading-relaxed shadow-sm relative group transition-all ${
                  msg.sender === 'user'
                    ? 'bg-cyan-50 border border-cyan-100 text-cyan-900 rounded-tr-none font-medium'
                    : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none font-medium'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Integrated WhatsApp Share Action Footer for Bot Messages */}
                {msg.sender === 'bot' && msg.id !== 'welcome' && msg.id.indexOf('-b-success') < 0 && msg.id.indexOf('-b-ask-email') < 0 && msg.id.indexOf('-b-email-ok') < 0 && (
                  <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 flex justify-end">
                    <button
                      onClick={() => handleShareToWhatsApp(msg.text)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-lg text-[8px] font-bold font-mono text-emerald-700 transition-all uppercase tracking-wider cursor-pointer"
                    >
                      <Share2 className="w-3 h-3 text-emerald-600" />
                      <span>Enviar a WhatsApp</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Interactive Report Selector in the Chat Logs */}
          {reportFlowStep === 2 && (
            <div className="flex flex-col max-w-[90%] mr-auto items-start animate-fade-in">
              <div className="p-4 bg-slate-50 border border-cyan-100 rounded-2xl rounded-tl-none shadow-sm space-y-3">
                <span className="text-[9px] font-bold text-cyan-700 uppercase tracking-widest block">Seleccionar Módulo Activo:</span>
                <div className="flex flex-col gap-2">
                  {selectedCenter.cages.slice(0, 3).map(cage => (
                    <button
                      key={cage.id}
                      onClick={() => handleSelectReportForEmail(cage)}
                      className="px-3.5 py-2.5 bg-white hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-slate-700 hover:text-cyan-800 text-[11px] font-bold rounded-xl transition-all cursor-pointer text-left flex items-center justify-between shadow-xs min-w-[200px]"
                    >
                      <span>{cage.name.replace('Jaula', 'Módulo')}</span>
                      <span className={`w-2 h-2 rounded-full ${
                        cage.status === 'optimal' 
                          ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' 
                          : cage.status === 'warning' 
                          ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' 
                          : 'bg-red-500 shadow-[0_0_6px_#ef4444]'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-cyan-600 font-mono text-[9.5px] px-2 py-1.5 bg-cyan-50 border border-cyan-100/50 rounded-lg w-max animate-pulse font-bold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Sincronizando telemetría...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Minimalist Floating Banner Alerts */}
        {toastMessage && (
          <div className="mx-5 mb-3 bg-emerald-50 border border-emerald-200 text-emerald-800 py-2 px-4 rounded-xl flex items-center gap-2 text-[9.5px] font-mono shadow-sm animate-fade-in z-10 font-bold">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Light Input Deck */}
        <div className="p-4 border-t border-slate-100 bg-white z-10">
          <div className="flex gap-2.5">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder={
                reportFlowStep === 1 
                  ? "Escribe el correo destinatario..." 
                  : "Pregunta sobre mallas, fondeos o informes..."
              }
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 text-[11px] transition-all"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !inputValue.trim()}
              className="px-4.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center shrink-0 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
