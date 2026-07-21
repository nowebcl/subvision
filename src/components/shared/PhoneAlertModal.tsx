import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Phone, Video, MoreVertical, ShieldAlert, CheckCheck, Send, Check, AlertTriangle, ExternalLink, Wrench, UserCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'system' | 'user';
  text: string;
  time: string;
  isInitialAlert?: boolean;
  photoUrl?: string;
  quickButtons?: { label: string; actionText: string; icon?: any }[];
}

// Subtle WhatsApp notification sound synthesizer
const playWhatsAppPing = () => {
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

export const PhoneAlertModal: React.FC = () => {
  const { isPhoneModalOpen, setIsPhoneModalOpen, phoneModalMessage, selectedCenter, rovReports } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPhoneModalOpen && phoneModalMessage) {
      playWhatsAppPing();

      // Find matching photo from report
      let detectedPhoto = '/report_pecera409.jpg';
      if (phoneModalMessage.toLowerCase().includes('102') || phoneModalMessage.toLowerCase().includes('biofouling')) {
        detectedPhoto = '/report_ins311.png';
      } else if (phoneModalMessage.toLowerCase().includes('101') || phoneModalMessage.toLowerCase().includes('óptimo')) {
        detectedPhoto = '/report_ins301.png';
      }

      setMessages([
        {
          id: 'initial',
          sender: 'system',
          text: phoneModalMessage,
          time: new Date().toLocaleTimeString().substring(0, 5),
          isInitialAlert: true,
          photoUrl: detectedPhoto,
          quickButtons: [
            { label: '🛠️ Despachar Cuadrilla', actionText: 'Requiero despachar cuadrilla de buceo a terreno inmediatamente.' },
            { label: '📞 Contactar Piloto', actionText: 'Contactar al Piloto ROV de guardia para revisión de cámara live.' },
            { label: '✅ Confirmar Recepción', actionText: 'Confirmo recepción de la alerta de seguridad.' }
          ]
        }
      ]);
      setInputText('');
      setIsTyping(false);
    }
  }, [isPhoneModalOpen, phoneModalMessage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isPhoneModalOpen) return null;

  const triggerReply = (userText: string, customSystemReply?: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString().substring(0, 5)
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      playWhatsAppPing();
      setIsTyping(false);
      const replyText = customSystemReply || '✅ Central SERVIROV: Recibido. Hemos notificado al jefe de centro y activado el protocolo de respuesta técnica en terreno.';
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'system',
          text: replyText,
          time: new Date().toLocaleTimeString().substring(0, 5)
        }
      ]);
    }, 1200);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    triggerReply(inputText.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative flex flex-col items-center">
        
        {/* Smartphone Shell Mockup */}
        <div className="w-[340px] h-[670px] bg-slate-950 rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-700/80 relative flex flex-col overflow-hidden ring-2 ring-cyan-500/20">
          
          {/* Bezel Dynamic Island / Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center gap-2 border border-slate-800">
            <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full" />
            <div className="w-1.5 h-1.5 bg-cyan-900/60 rounded-full" />
          </div>

          {/* Screen Container */}
          <div className="flex-1 rounded-[38px] bg-[#efeae2] flex flex-col overflow-hidden relative font-sans">
            
            {/* Phone Status Bar */}
            <div className="h-9 bg-[#075e54] text-white px-6 pt-2.5 flex justify-between items-center text-[10px] font-mono font-semibold z-20 select-none">
              <span>{new Date().toLocaleTimeString().substring(0, 5)}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold">5G</span>
                <div className="w-4 h-2 bg-white rounded-xs" />
              </div>
            </div>

            {/* WhatsApp Verified Business Header */}
            <div className="bg-[#075e54] text-white px-3 py-2.5 flex items-center justify-between shadow-md z-20 select-none border-b border-teal-800">
              <div className="flex items-center gap-2.5">
                <div className="relative rounded-full bg-white border border-teal-300 flex items-center justify-center overflow-hidden shrink-0 shadow-sm" style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px' }}>
                  <img src="/LOGO_CIRCULAR.png" alt="Servirov Logo" className="w-full h-full object-cover" style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', display: 'block' }} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-xs leading-tight tracking-tight">SERVIROV Operaciones</h4>
                    {/* Verified Green Checkmark Badge */}
                    <span className="bg-emerald-400 text-teal-950 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black" title="Cuenta de Empresa Verificada">
                      ✓
                    </span>
                  </div>
                  <span className="text-[9px] text-teal-100/90 leading-none block mt-0.5">
                    {isTyping ? 'escribiendo...' : 'Cuenta de Empresa • En línea'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-white/90">
                <Video className="w-4 h-4 cursor-pointer hover:text-teal-200" />
                <Phone className="w-3.5 h-3.5 cursor-pointer hover:text-teal-200" />
                <MoreVertical className="w-4 h-4 cursor-pointer hover:text-teal-200" />
              </div>
            </div>

            {/* Chat Messages Body with Pattern */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 relative flex flex-col bg-[#efeae2]">
              
              {/* WhatsApp Date Badge */}
              <div className="mx-auto bg-white/80 backdrop-blur-xs text-slate-600 text-[9px] px-3 py-0.5 rounded-md shadow-xs font-bold uppercase tracking-wider my-1 select-none border border-slate-200/50">
                HOY
              </div>

              {messages.map((msg) => {
                if (msg.sender === 'system') {
                  const lines = msg.text.split('\n');
                  return (
                    <div 
                      key={msg.id} 
                      className="self-start max-w-[92%] bg-white rounded-r-xl rounded-bl-xl p-3 shadow-md relative border-l-4 border-red-500 text-xs animate-fade-in text-left"
                    >
                      {msg.isInitialAlert && (
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                          <div className="flex items-center gap-1.5 text-red-600 font-extrabold text-[10px] uppercase tracking-wider">
                            <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
                            <span>ALERTA DE SEGURIDAD MARÍTIMA</span>
                          </div>
                          <span className="text-[8px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded font-mono">
                            URGENTE
                          </span>
                        </div>
                      )}

                      {/* ROV Inspection Snapshot Image Header */}
                      {msg.photoUrl && (
                        <div className="mb-2.5 rounded-lg overflow-hidden border border-slate-200 relative group">
                          <img 
                            src={msg.photoUrl} 
                            alt="ROV Inspection Snapshot" 
                            className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105" 
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-xs px-2 py-1 text-[9px] text-white font-mono flex items-center justify-between">
                            <span>📸 Captura Registro ROV</span>
                            <span className="text-cyan-400 font-bold">SUBVISION OS</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1 font-sans text-slate-800 text-[11px] leading-relaxed">
                        {lines.map((line, idx) => (
                          <p key={idx} className={line.startsWith('🚨') ? 'font-bold text-slate-900 text-xs border-b border-slate-100 pb-1 mb-1' : ''}>
                            {line}
                          </p>
                        ))}
                      </div>

                      {/* WhatsApp Interactive Buttons */}
                      {msg.quickButtons && msg.quickButtons.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-100 space-y-1.5">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Acciones Rápidas WhatsApp:</span>
                          {msg.quickButtons.map((btn, bIdx) => (
                            <button
                              key={bIdx}
                              onClick={() => triggerReply(btn.actionText)}
                              className="w-full py-1.5 px-2 bg-teal-50 hover:bg-teal-100/80 text-teal-800 text-[10px] font-bold rounded-lg border border-teal-200 transition-all flex items-center justify-between cursor-pointer active:scale-98"
                            >
                              <span>{btn.label}</span>
                              <span className="text-[10px] font-bold text-teal-600">→</span>
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-1 mt-2 text-[8px] text-slate-400 font-semibold">
                        <span>{msg.time}</span>
                      </div>

                      <div className="absolute top-0 -left-1.5 w-0 h-0 border-t-[8px] border-t-white border-l-[8px] border-l-transparent" />
                    </div>
                  );
                } else {
                  return (
                    <div 
                      key={msg.id} 
                      className="self-end max-w-[85%] bg-[#dcf8c6] rounded-l-xl rounded-br-xl p-2.5 shadow-sm relative text-xs text-slate-800 animate-fade-in text-left"
                    >
                      <p className="text-[11px] leading-relaxed break-words font-medium">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-slate-500 font-semibold">
                        <span>{msg.time}</span>
                        <CheckCheck className="w-3.5 h-3.5 text-cyan-600" />
                      </div>
                      <div className="absolute top-0 -right-1.5 w-0 h-0 border-t-[8px] border-t-[#dcf8c6] border-r-[8px] border-r-transparent" />
                    </div>
                  );
                }
              })}

              {isTyping && (
                <div className="self-start bg-white/90 rounded-2xl px-3 py-2 shadow-xs text-[10px] text-slate-500 font-medium flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* WhatsApp Interactive Input Footer */}
            <form onSubmit={handleSendMessage} className="p-2 bg-[#f0f2f5] flex items-center gap-2 border-t border-slate-200">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe una respuesta..."
                className="flex-1 bg-white rounded-full px-3.5 py-1.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all cursor-pointer ${
                  inputText.trim() ? 'bg-[#128c7e] text-white hover:bg-[#075e54] scale-105' : 'bg-slate-300 text-slate-100 cursor-not-allowed'
                }`}
                title="Enviar mensaje"
              >
                <Send className="w-4 h-4 transform rotate-45 -translate-x-0.5" />
              </button>
            </form>

          </div>
        </div>

        {/* Action Button to Close Modal */}
        <button
          onClick={() => setIsPhoneModalOpen(false)}
          className="mt-4 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-sm shadow-xl transition-all cursor-pointer flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          <span>Cerrar Simulador WhatsApp</span>
        </button>

      </div>
    </div>
  );
};

