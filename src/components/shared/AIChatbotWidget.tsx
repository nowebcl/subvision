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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: `🤖 Hola, ¿cómo estás? Soy tu asistente técnico de SubVision.

Estoy aquí para darte una mano con los informes de ROV, los anclajes y lo que necesites del centro.

Dime si quieres saber sobre:
• ¿Cómo están las jaulas del centro hoy?
• ¿Qué reportes críticos tenemos registrados?
• Cuéntame sobre la Jaula 105.

Conversemos con confianza. Y recuerda que al pie de mis respuestas puedes enviar el informe directo a WhatsApp.`,
          timestamp: new Date()
        }
      ]);
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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

    try {
      // Gather active reports text context
      const centerReports = rovReports.filter(r => r.centroId === selectedCenter.id);
      const reportsContext = centerReports.length > 0
        ? centerReports.map((r, i) => `Informe ${i + 1}: ${r.nombre} (Fecha: ${r.fecha}, Piloto: ${r.piloto}, Puerto/Estado: ${r.puerto}, Detalle: ${r.redes})`).join('\n')
        : 'No hay informes registrados en este centro de cultivo.';

      // Gather cages integrity status
      const cagesContext = selectedCenter.cages.map(c => `Jaula: ${c.name}, Especie: ${c.species}, Densidad: ${c.count} peces, Integridad Malla: ${c.netIntegrity}%, Estado General: ${c.status.toUpperCase()}`).join('\n');

      // Mooring lines status
      const mooringContext = selectedCenter.mooringLines.map(m => `Fondeo: ${m.code}, Tensión: ${m.tensionKn} kN (Límite: ${m.limitKn} kN), Estado: ${m.status.toUpperCase()}`).join('\n');

      // Water params
      const waterContext = `Temperatura: ${selectedCenter.waterParams.temperature}°C, Oxígeno Disuelto: ${selectedCenter.waterParams.dissolvedOxygen} mg/L, pH: ${selectedCenter.waterParams.ph}, Velocidad Corriente: ${selectedCenter.waterParams.currentSpeed} nudos.`;

      // Construct system prompt with fluid, human-like instructions
      const systemPrompt = `Eres el Asistente Inteligente de SUBVISION (plataforma de SERVIROV). Tu misión es ayudar al operador a evaluar informes técnicos, telemetrías y la seguridad de las jaulas.

DATOS DEL CENTRO ACTIVO:
- Centro: ${selectedCenter.name}
- Ubicación: ${selectedCenter.location}, ${selectedCenter.region}
- Coordenadas: ${selectedCenter.coordinates}

TELEMETRÍA DE AGUA EN VIVO:
${waterContext}

ESTADO DE INTEGRIDAD DE JAULAS:
${cagesContext}

LÍNEAS DE ANCLAJE Y FONDEOS:
${mooringContext}

HISTORIAL DE INFORMES DE ROV EN ESTE CENTRO:
${reportsContext}

DIRECTRICES DE PERSONALIDAD Y TONO (MUY IMPORTANTE):
1. No seas robótico, rígido ni demasiado estructurado. Habla como un colega supervisor experto en acuicultura: de manera fluida, natural, empática y cercana.
2. Evita listados de datos fríos sin explicación. Analiza la información, explica qué significan los números (ej. si una integridad de 74.2% es peligrosa, explícalo de forma lógica y cercana) y da recomendaciones prácticas.
3. Si el usuario pide enviar un reporte a WhatsApp o simularlo, indícale qué reporte estás enviando de forma amable ("Dale, ahí te preparo el mensaje para WhatsApp...") e invítalo a hacer clic en el botón verde "Enviar a WhatsApp" que tiene al final de tu mensaje.
4. Usa un tono cercano y amigable de apoyo técnico.`;

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
        text: `Disculpa, tuve un pequeño percance al procesar los datos: ${err.message || 'No pude conectarme al servidor de IA.'}. ¿Podríamos intentar nuevamente?`,
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
                {msg.sender === 'bot' && msg.id !== 'welcome' && (
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
          <div className="mx-5 mb-3 bg-emerald-50 border border-emerald-200 text-emerald-800 py-2 px-4 rounded-xl flex items-center gap-2 text-[9px] font-mono shadow-sm animate-fade-in z-10 font-bold">
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
              placeholder="Pregunta sobre mallas, fondeos o informes..."
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
