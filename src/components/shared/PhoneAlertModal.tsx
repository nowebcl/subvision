import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Phone, Video, MoreVertical, ShieldAlert, CheckCheck, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'system' | 'user';
  text: string;
  time: string;
  isInitialAlert?: boolean;
}

export const PhoneAlertModal: React.FC = () => {
  const { isPhoneModalOpen, setIsPhoneModalOpen, phoneModalMessage } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPhoneModalOpen && phoneModalMessage) {
      setMessages([
        {
          id: 'initial',
          sender: 'system',
          text: phoneModalMessage,
          time: new Date().toLocaleTimeString().substring(0, 5),
          isInitialAlert: true
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

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString().substring(0, 5)
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate auto-reply from SERVIROV Operaciones
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'system',
          text: '✅ Recibido en Central de Monitoreo SERVIROV. Hemos registrado su confirmación y activado el protocolo técnico de respuesta rápida en terreno.',
          time: new Date().toLocaleTimeString().substring(0, 5)
        }
      ]);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative flex flex-col items-center">
        
        {/* Smartphone Shell Mockup */}
        <div className="w-[320px] h-[630px] bg-slate-900 rounded-[45px] p-3 shadow-2xl border-4 border-slate-700/80 relative flex flex-col overflow-hidden ring-1 ring-slate-800">
          
          {/* Bezel details */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-full z-30 flex items-center justify-center">
            <div className="w-3.5 h-3.5 bg-zinc-900 rounded-full mr-2" />
            <div className="w-1.5 h-1.5 bg-blue-950 rounded-full" />
          </div>

          {/* Screen Content */}
          <div className="flex-1 rounded-[36px] bg-slate-100 flex flex-col overflow-hidden relative font-sans">
            
            {/* Phone Status Bar */}
            <div className="h-10 bg-[#075e54] text-white px-6 pt-3 flex justify-between items-center text-[10px] font-semibold tracking-tight z-10 select-none">
              <span>{new Date().toLocaleTimeString().substring(0, 5)}</span>
              <div className="flex items-center gap-1">
                <span>5G</span>
                <div className="w-4 h-2 bg-white rounded-xs" />
              </div>
            </div>

            {/* WhatsApp App Header */}
            <div className="bg-[#075e54] text-white px-3 py-2 flex items-center justify-between shadow-md z-10 select-none">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                  <img src="/LOGO_CIRCULAR.png" alt="Servirov Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-xs leading-tight">SERVIROV Operaciones</h4>
                  <span className="text-[9px] text-teal-100 leading-none block">
                    {isTyping ? 'escribiendo...' : 'en línea'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3.5 text-white/90">
                <Video className="w-4 h-4 cursor-pointer" />
                <Phone className="w-3.5 h-3.5 cursor-pointer" />
                <MoreVertical className="w-4 h-4 cursor-pointer" />
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 relative flex flex-col bg-[#efeae2]">
              
              {/* Info timestamp badge */}
              <div className="mx-auto bg-white/70 backdrop-blur-xs text-slate-500 text-[9px] px-2 py-0.5 rounded-lg shadow-xs font-semibold my-1 select-none">
                HOY
              </div>

              {messages.map((msg) => {
                if (msg.sender === 'system') {
                  const lines = msg.text.split('\n');
                  return (
                    <div 
                      key={msg.id} 
                      className="self-start max-w-[88%] bg-white rounded-r-xl rounded-bl-xl p-3 shadow-xs relative border-l-4 border-red-500 text-xs animate-fade-in"
                    >
                      {msg.isInitialAlert && (
                        <div className="flex items-center gap-1.5 text-red-600 font-bold text-[9px] uppercase tracking-wider mb-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>ALERTA AUTOMÁTICA</span>
                        </div>
                      )}

                      <div className="space-y-1 font-sans text-slate-800 text-[11px] leading-relaxed">
                        {lines.map((line, idx) => (
                          <p key={idx} className={line.startsWith('🚨') ? 'font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1' : ''}>
                            {line}
                          </p>
                        ))}
                      </div>

                      <div className="flex items-center justify-end gap-1 mt-1.5 text-[8px] text-slate-400 font-semibold">
                        <span>{msg.time}</span>
                      </div>

                      <div className="absolute top-0 -left-1.5 w-0 h-0 border-t-[8px] border-t-white border-l-[8px] border-l-transparent" />
                    </div>
                  );
                } else {
                  return (
                    <div 
                      key={msg.id} 
                      className="self-end max-w-[85%] bg-[#dcf8c6] rounded-l-xl rounded-br-xl p-2.5 shadow-xs relative text-xs text-slate-800 animate-fade-in"
                    >
                      <p className="text-[11px] leading-relaxed break-words">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-slate-500 font-semibold">
                        <span>{msg.time}</span>
                        <CheckCheck className="w-3 h-3 text-cyan-600" />
                      </div>
                      <div className="absolute top-0 -right-1.5 w-0 h-0 border-t-[8px] border-t-[#dcf8c6] border-r-[8px] border-r-transparent" />
                    </div>
                  );
                }
              })}

              {isTyping && (
                <div className="self-start bg-white/90 rounded-2xl px-3 py-2 shadow-xs text-[10px] text-slate-500 font-medium flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* WhatsApp Footer Input Bar (Interactive) */}
            <form onSubmit={handleSendMessage} className="p-2 bg-[#f0f2f5] flex items-center gap-2 border-t border-slate-200">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-white rounded-full px-3.5 py-1.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-all cursor-pointer ${
                  inputText.trim() ? 'bg-[#128c7e] text-white hover:bg-[#075e54] scale-105' : 'bg-slate-300 text-slate-100 cursor-not-allowed'
                }`}
                title="Enviar mensaje"
              >
                <Send className="w-4 h-4 transform rotate-45 -translate-x-0.5" />
              </button>
            </form>

          </div>
        </div>

        {/* Action button to close */}
        <button
          onClick={() => setIsPhoneModalOpen(false)}
          className="mt-4 px-5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-sm shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
        >
          <X className="w-4 h-4" />
          <span>Cerrar Simulador</span>
        </button>

      </div>
    </div>
  );
};
